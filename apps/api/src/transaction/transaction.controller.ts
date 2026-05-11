import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Put,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, TransactionStatus } from '@avancepharma/shared';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @Roles(UserRole.EMPLOYEE, UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  create(@Body() createTransactionDto: CreateTransactionDto, @Request() req: any) {
    return this.transactionService.create(createTransactionDto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN, UserRole.PHARMACY_AGENT, UserRole.HR_MANAGER)
  async findAll(@Request() req: any) {
    const user = req.user;

    switch (user.role) {
      case UserRole.PHARMACY_AGENT:
        return this.transactionService.findByPharmacyAgent(user.sub);
      case UserRole.PHARMACY_ADMIN:
        // Get all pharmacies where user is admin, then get transactions
        // For now, return all - this could be enhanced
        return this.transactionService.findAll();
      case UserRole.HR_MANAGER:
        // Get all employees under HR manager's employers, then get transactions
        // For now, return all - this could be enhanced
        return this.transactionService.findAll();
      default:
        return this.transactionService.findAll();
    }
  }

  @Get('my-transactions')
  @Roles(UserRole.EMPLOYEE)
  getMyTransactions(@Request() req: any) {
    // This would need to find the employee ID from user ID
    // For now, we'll assume the user.sub is the employee ID
    return this.transactionService.findByEmployee(req.user.sub);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN, UserRole.PHARMACY_AGENT, UserRole.HR_MANAGER, UserRole.EMPLOYEE)
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.transactionService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN, UserRole.HR_MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Request() req: any,
  ) {
    return this.transactionService.update(id, updateTransactionDto, req.user.sub);
  }

  @Put(':id/validate')
  @Roles(UserRole.PHARMACY_AGENT, UserRole.PHARMACY_ADMIN)
  validateTransaction(
    @Param('id') id: string,
    @Body() body: { approvedAmount: number },
    @Request() req: any,
  ) {
    return this.transactionService.validateTransaction(id, body.approvedAmount, req.user.sub);
  }

  @Put(':id/cancel')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN, UserRole.PHARMACY_AGENT, UserRole.HR_MANAGER)
  cancelTransaction(@Param('id') id: string, @Request() req: any) {
    return this.transactionService.cancelTransaction(id, req.user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.transactionService.remove(id, req.user.sub);
  }

  // Analytics endpoints
  @Get('employee/:employeeId/monthly-usage')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.EMPLOYEE)
  getMonthlyUsage(
    @Param('employeeId') employeeId: string,
    @Query('year') year: number,
    @Query('month') month: number,
    @Request() req: any,
  ) {
    // Check permissions - employees can only see their own usage
    if (req.user.role === UserRole.EMPLOYEE && req.user.sub !== employeeId) {
      throw new Error('Access denied');
    }

    return this.transactionService.getMonthlyUsage(employeeId, year, month);
  }

  @Get('pharmacy/:pharmacyId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN, UserRole.PHARMACY_AGENT)
  getPharmacyTransactions(@Param('pharmacyId') pharmacyId: string) {
    return this.transactionService.findByPharmacy(pharmacyId);
  }

  @Get('status/:status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN, UserRole.PHARMACY_AGENT, UserRole.HR_MANAGER)
  getTransactionsByStatus(@Param('status') status: TransactionStatus) {
    // This would need to be implemented in the service
    // For now, we'll filter from findAll
    return this.transactionService.findAll().then(transactions =>
      transactions.filter(tx => tx.status === status)
    );
  }
}