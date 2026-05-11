import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employer } from './employer.entity';
import { Employee } from './employee.entity';
import { EmployeeCap } from './employee-cap.entity';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { UpdateEmployerDto } from './dto/update-employer.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateEmployeeCapDto } from './dto/create-employee-cap.dto';
import { UpdateEmployeeCapDto } from './dto/update-employee-cap.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@avancepharma/shared';

@Injectable()
export class EmployerService {
  constructor(
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeCap)
    private employeeCapRepository: Repository<EmployeeCap>,
    private auditService: AuditService,
  ) {}

  // Employer CRUD
  async create(createEmployerDto: CreateEmployerDto, userId: string): Promise<Employer> {
    const employer = this.employerRepository.create(createEmployerDto);
    const savedEmployer = await this.employerRepository.save(employer);

    // Audit log
    await this.auditService.log(
      AuditAction.CREATE,
      userId,
      'Employer',
      savedEmployer.id,
      undefined,
      { name: savedEmployer.name, contactEmail: savedEmployer.contactEmail },
    );

    return savedEmployer;
  }

  async findAll(): Promise<Employer[]> {
    return this.employerRepository.find({
      relations: ['employees'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Employer> {
    const employer = await this.employerRepository.findOne({
      where: { id },
      relations: ['employees', 'employees.user', 'employees.caps'],
    });

    if (!employer) {
      throw new NotFoundException(`Employer with ID ${id} not found`);
    }

    return employer;
  }

  async update(id: string, updateEmployerDto: UpdateEmployerDto, userId: string): Promise<Employer> {
    const employer = await this.findOne(id);
    const oldValues = {
      name: employer.name,
      sector: employer.sector,
      contactEmail: employer.contactEmail,
      phone: employer.phone,
      isActive: employer.isActive,
    };

    Object.assign(employer, updateEmployerDto);
    const updatedEmployer = await this.employerRepository.save(employer);

    // Audit log
    await this.auditService.log(
      AuditAction.UPDATE,
      userId,
      'Employer',
      id,
      oldValues,
      {
        name: updatedEmployer.name,
        sector: updatedEmployer.sector,
        contactEmail: updatedEmployer.contactEmail,
        phone: updatedEmployer.phone,
        isActive: updatedEmployer.isActive,
      },
    );

    return updatedEmployer;
  }

  async remove(id: string, userId: string): Promise<void> {
    const employer = await this.findOne(id);
    const oldValues = {
      name: employer.name,
      contactEmail: employer.contactEmail,
      isActive: employer.isActive,
    };

    await this.employerRepository.softDelete(id);

    // Audit log
    await this.auditService.log(
      AuditAction.DELETE,
      userId,
      'Employer',
      id,
      oldValues,
      undefined,
    );
  }

  // Employee CRUD
  async createEmployee(createEmployeeDto: CreateEmployeeDto, userId: string): Promise<Employee> {
    // Check if user is already an employee
    const existingEmployee = await this.employeeRepository.findOne({
      where: { userId: createEmployeeDto.userId },
    });

    if (existingEmployee) {
      throw new BadRequestException('User is already an employee');
    }

    const employee = this.employeeRepository.create(createEmployeeDto);
    const savedEmployee = await this.employeeRepository.save(employee);

    // Audit log
    await this.auditService.log(
      AuditAction.CREATE,
      userId,
      'Employee',
      savedEmployee.id,
      undefined,
      {
        matricule: savedEmployee.matricule,
        firstName: savedEmployee.firstName,
        lastName: savedEmployee.lastName,
      },
    );

    return savedEmployee;
  }

  async findEmployeesByEmployer(employerId: string): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: { employerId },
      relations: ['user', 'caps', 'employer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findEmployeeById(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['user', 'caps', 'employer'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto, userId: string): Promise<Employee> {
    const employee = await this.findEmployeeById(id);
    const oldValues = {
      matricule: employee.matricule,
      firstName: employee.firstName,
      lastName: employee.lastName,
      department: employee.department,
      isActive: employee.isActive,
    };

    Object.assign(employee, updateEmployeeDto);
    const updatedEmployee = await this.employeeRepository.save(employee);

    // Audit log
    await this.auditService.log(
      AuditAction.UPDATE,
      userId,
      'Employee',
      id,
      oldValues,
      {
        matricule: updatedEmployee.matricule,
        firstName: updatedEmployee.firstName,
        lastName: updatedEmployee.lastName,
        department: updatedEmployee.department,
        isActive: updatedEmployee.isActive,
      },
    );

    return updatedEmployee;
  }

  async removeEmployee(id: string, userId: string): Promise<void> {
    const employee = await this.findEmployeeById(id);
    const oldValues = {
      matricule: employee.matricule,
      firstName: employee.firstName,
      lastName: employee.lastName,
    };

    await this.employeeRepository.remove(employee);

    // Audit log
    await this.auditService.log(
      AuditAction.DELETE,
      userId,
      'Employee',
      id,
      oldValues,
      undefined,
    );
  }

  // Employee Cap CRUD
  async createEmployeeCap(createEmployeeCapDto: CreateEmployeeCapDto, userId: string): Promise<EmployeeCap> {
    const cap = this.employeeCapRepository.create({
      ...createEmployeeCapDto,
      monthlyCapAmount: createEmployeeCapDto.monthlyCapAmount.toString(),
      validFrom: new Date(createEmployeeCapDto.validFrom),
      validTo: createEmployeeCapDto.validTo ? new Date(createEmployeeCapDto.validTo) : null,
    });
    const savedCap = await this.employeeCapRepository.save(cap);

    // Audit log
    await this.auditService.log(
      AuditAction.CREATE,
      userId,
      'EmployeeCap',
      savedCap.id,
      undefined,
      {
        employeeId: savedCap.employeeId,
        monthlyCapAmount: savedCap.monthlyCapAmount,
        validFrom: savedCap.validFrom,
      },
    );

    return savedCap;
  }

  async findCapsByEmployee(employeeId: string): Promise<EmployeeCap[]> {
    return this.employeeCapRepository.find({
      where: { employeeId },
      relations: ['employee'],
      order: { validFrom: 'DESC' },
    });
  }

  async updateEmployeeCap(id: string, updateEmployeeCapDto: UpdateEmployeeCapDto, userId: string): Promise<EmployeeCap> {
    const cap = await this.employeeCapRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!cap) {
      throw new NotFoundException(`Employee cap with ID ${id} not found`);
    }

    const oldValues = {
      employeeId: cap.employeeId,
      monthlyCapAmount: cap.monthlyCapAmount,
      validFrom: cap.validFrom,
      validTo: cap.validTo,
    };

    Object.assign(cap, {
      ...updateEmployeeCapDto,
      monthlyCapAmount: updateEmployeeCapDto.monthlyCapAmount?.toString(),
      validFrom: updateEmployeeCapDto.validFrom ? new Date(updateEmployeeCapDto.validFrom) : cap.validFrom,
      validTo: updateEmployeeCapDto.validTo ? new Date(updateEmployeeCapDto.validTo) : cap.validTo,
    });

    const updatedCap = await this.employeeCapRepository.save(cap);

    // Audit log
    await this.auditService.log(
      AuditAction.UPDATE,
      userId,
      'EmployeeCap',
      id,
      oldValues,
      {
        employeeId: updatedCap.employeeId,
        monthlyCapAmount: updatedCap.monthlyCapAmount,
        validFrom: updatedCap.validFrom,
        validTo: updatedCap.validTo,
      },
    );

    return updatedCap;
  }

  async removeEmployeeCap(id: string, userId: string): Promise<void> {
    const cap = await this.employeeCapRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!cap) {
      throw new NotFoundException(`Employee cap with ID ${id} not found`);
    }

    const oldValues = {
      employeeId: cap.employeeId,
      monthlyCapAmount: cap.monthlyCapAmount,
    };

    await this.employeeCapRepository.remove(cap);

    // Audit log
    await this.auditService.log(
      AuditAction.DELETE,
      userId,
      'EmployeeCap',
      id,
      oldValues,
      undefined,
    );
  }
}