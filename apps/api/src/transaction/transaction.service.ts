import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AuditService } from '../audit/audit.service';
import { EmployerService } from '../employer/employer.service';
import { PharmacyService } from '../pharmacy/pharmacy.service';
import { UsersService } from '../users/users.service';
import { AuditAction, TransactionStatus, UserRole } from '@avancepharma/shared';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private auditService: AuditService,
    private employerService: EmployerService,
    private pharmacyService: PharmacyService,
    private usersService: UsersService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, createdBy: string): Promise<Transaction> {
    // Validate employee exists and is active
    const employee = await this.employerService.findEmployeeById(createTransactionDto.employeeId);
    if (!employee.isActive) {
      throw new BadRequestException('Employee is not active');
    }

    // Validate pharmacy exists and is active
    const pharmacy = await this.pharmacyService.findOne(createTransactionDto.pharmacyId);
    if (!pharmacy.isActive) {
      throw new BadRequestException('Pharmacy is not active');
    }

    // Check if employee belongs to an employer that has agreement with this pharmacy
    // For now, we'll allow any pharmacy, but this could be enhanced with pharmacy-employer agreements

    // Check monthly cap for the employee
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyTransactions = await this.transactionRepository.find({
      where: {
        employeeId: createTransactionDto.employeeId,
        status: TransactionStatus.VALIDATED,
        transactionDate: Between(currentMonth, nextMonth),
      },
    });

    const monthlyTotal = monthlyTransactions.reduce(
      (sum, tx) => sum + parseFloat(tx.approvedAmount || tx.requestedAmount),
      0,
    );

    // Get current employee cap
    const currentCap = await this.getCurrentEmployeeCap(createTransactionDto.employeeId, new Date());

    if (currentCap && monthlyTotal + createTransactionDto.requestedAmount > parseFloat(currentCap.monthlyCapAmount)) {
      throw new BadRequestException(
        `Requested amount exceeds monthly cap. Current usage: ${monthlyTotal}, Cap: ${currentCap.monthlyCapAmount}`,
      );
    }

    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      requestedAmount: createTransactionDto.requestedAmount.toString(),
      transactionDate: new Date(createTransactionDto.transactionDate),
      status: TransactionStatus.PENDING,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Audit log
    await this.auditService.log(
      AuditAction.CREATE,
      createdBy,
      'Transaction',
      savedTransaction.id,
      undefined,
      {
        employeeId: savedTransaction.employeeId,
        pharmacyId: savedTransaction.pharmacyId,
        requestedAmount: savedTransaction.requestedAmount,
        transactionDate: savedTransaction.transactionDate,
      },
    );

    return savedTransaction;
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.find({
      relations: ['employee', 'employee.user', 'pharmacy', 'pharmacyAgent'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['employee', 'employee.user', 'employee.employer', 'pharmacy', 'pharmacyAgent'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async findByEmployee(employeeId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { employeeId },
      relations: ['employee', 'employee.user', 'pharmacy', 'pharmacyAgent'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPharmacy(pharmacyId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { pharmacyId },
      relations: ['employee', 'employee.user', 'pharmacy', 'pharmacyAgent'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPharmacyAgent(agentId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { pharmacyAgentId: agentId },
      relations: ['employee', 'employee.user', 'pharmacy', 'pharmacyAgent'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto, updatedBy: string): Promise<Transaction> {
    const transaction = await this.findOne(id);
    const oldValues = {
      requestedAmount: transaction.requestedAmount,
      approvedAmount: transaction.approvedAmount,
      status: transaction.status,
      notes: transaction.notes,
    };

    Object.assign(transaction, {
      ...updateTransactionDto,
      approvedAmount: updateTransactionDto.approvedAmount?.toString(),
    });

    const updatedTransaction = await this.transactionRepository.save(transaction);

    // Audit log
    await this.auditService.log(
      AuditAction.UPDATE,
      updatedBy,
      'Transaction',
      id,
      oldValues,
      {
        requestedAmount: updatedTransaction.requestedAmount,
        approvedAmount: updatedTransaction.approvedAmount,
        status: updatedTransaction.status,
        notes: updatedTransaction.notes,
      },
    );

    return updatedTransaction;
  }

  async validateTransaction(id: string, approvedAmount: number, agentId: string): Promise<Transaction> {
    const transaction = await this.findOne(id);

    // Check if agent belongs to the pharmacy
    const pharmacyAgents = await this.pharmacyService.findAgentsByPharmacy(transaction.pharmacyId);
    const isAgentOfPharmacy = pharmacyAgents.some(agent => agent.userId === agentId);

    if (!isAgentOfPharmacy) {
      throw new ForbiddenException('Agent does not belong to this pharmacy');
    }

    // Check cap compliance
    const currentMonth = new Date(transaction.transactionDate);
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyTransactions = await this.transactionRepository.find({
      where: {
        employeeId: transaction.employeeId,
        status: TransactionStatus.VALIDATED,
        transactionDate: Between(currentMonth, nextMonth),
      },
    });

    const monthlyTotal = monthlyTransactions.reduce(
      (sum, tx) => sum + parseFloat(tx.approvedAmount || tx.requestedAmount),
      0,
    );

    const currentCap = await this.getCurrentEmployeeCap(transaction.employeeId, transaction.transactionDate);

    if (currentCap && monthlyTotal + approvedAmount > parseFloat(currentCap.monthlyCapAmount)) {
      throw new BadRequestException(
        `Approved amount would exceed monthly cap. Current usage: ${monthlyTotal}, Cap: ${currentCap.monthlyCapAmount}`,
      );
    }

    return this.update(
      id,
      {
        status: TransactionStatus.VALIDATED,
        approvedAmount,
      },
      agentId,
    ).then(async (transaction) => {
      // Update pharmacy agent separately since it's not in UpdateTransactionDto
      await this.transactionRepository.update(id, { pharmacyAgentId: agentId });
      transaction.pharmacyAgentId = agentId;
      return transaction;
    });
  }

  async cancelTransaction(id: string, cancelledBy: string): Promise<Transaction> {
    return this.update(id, { status: TransactionStatus.CANCELLED }, cancelledBy);
  }

  async remove(id: string, deletedBy: string): Promise<void> {
    const transaction = await this.findOne(id);
    const oldValues = {
      employeeId: transaction.employeeId,
      pharmacyId: transaction.pharmacyId,
      requestedAmount: transaction.requestedAmount,
      status: transaction.status,
    };

    await this.transactionRepository.softDelete(id);

    // Audit log
    await this.auditService.log(
      AuditAction.DELETE,
      deletedBy,
      'Transaction',
      id,
      oldValues,
      undefined,
    );
  }

  private async getCurrentEmployeeCap(employeeId: string, date: Date) {
    const employee = await this.employerService.findEmployeeById(employeeId);

    // Get the most recent cap that is valid for the given date
    const currentCap = employee.caps
      .filter(cap => cap.validFrom <= date && (!cap.validTo || cap.validTo >= date))
      .sort((a, b) => b.validFrom.getTime() - a.validFrom.getTime())[0];

    return currentCap;
  }

  async getMonthlyUsage(employeeId: string, year: number, month: number): Promise<{
    totalRequested: number;
    totalApproved: number;
    cap: number | null;
    transactions: Transaction[];
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const transactions = await this.transactionRepository.find({
      where: {
        employeeId,
        transactionDate: Between(startDate, endDate),
      },
      relations: ['pharmacy', 'pharmacyAgent'],
      order: { transactionDate: 'DESC' },
    });

    const totalRequested = transactions.reduce(
      (sum, tx) => sum + parseFloat(tx.requestedAmount),
      0,
    );

    const totalApproved = transactions
      .filter(tx => tx.status === TransactionStatus.VALIDATED)
      .reduce((sum, tx) => sum + parseFloat(tx.approvedAmount || tx.requestedAmount), 0);

    const currentCap = await this.getCurrentEmployeeCap(employeeId, startDate);
    const capAmount = currentCap ? parseFloat(currentCap.monthlyCapAmount) : null;

    return {
      totalRequested,
      totalApproved,
      cap: capAmount,
      transactions,
    };
  }
}