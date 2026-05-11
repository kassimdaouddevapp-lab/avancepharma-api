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
} from '@nestjs/common';
import { EmployerService } from './employer.service';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { UpdateEmployerDto } from './dto/update-employer.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateEmployeeCapDto } from './dto/create-employee-cap.dto';
import { UpdateEmployeeCapDto } from './dto/update-employee-cap.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@avancepharma/shared';

@Controller('employers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployerController {
  constructor(private readonly employerService: EmployerService) {}

  // Employer routes
  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createEmployerDto: CreateEmployerDto, @Request() req: any) {
    return this.employerService.create(createEmployerDto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  findAll() {
    return this.employerService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  findOne(@Param('id') id: string) {
    return this.employerService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateEmployerDto: UpdateEmployerDto,
    @Request() req: any,
  ) {
    return this.employerService.update(id, updateEmployerDto, req.user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.employerService.remove(id, req.user.sub);
  }

  // Employee routes
  @Post(':employerId/employees')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  createEmployee(
    @Param('employerId') employerId: string,
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Request() req: any,
  ) {
    // Override employerId from URL
    createEmployeeDto.employerId = employerId;
    return this.employerService.createEmployee(createEmployeeDto, req.user.sub);
  }

  @Get(':employerId/employees')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  findEmployeesByEmployer(@Param('employerId') employerId: string) {
    return this.employerService.findEmployeesByEmployer(employerId);
  }

  @Get('employees/:employeeId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  findEmployeeById(@Param('employeeId') employeeId: string) {
    return this.employerService.findEmployeeById(employeeId);
  }

  @Patch('employees/:employeeId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  updateEmployee(
    @Param('employeeId') employeeId: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Request() req: any,
  ) {
    return this.employerService.updateEmployee(employeeId, updateEmployeeDto, req.user.sub);
  }

  @Delete('employees/:employeeId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  removeEmployee(@Param('employeeId') employeeId: string, @Request() req: any) {
    return this.employerService.removeEmployee(employeeId, req.user.sub);
  }

  // Employee Cap routes
  @Post('employees/:employeeId/caps')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  createEmployeeCap(
    @Param('employeeId') employeeId: string,
    @Body() createEmployeeCapDto: CreateEmployeeCapDto,
    @Request() req: any,
  ) {
    // Override employeeId from URL
    createEmployeeCapDto.employeeId = employeeId;
    return this.employerService.createEmployeeCap(createEmployeeCapDto, req.user.sub);
  }

  @Get('employees/:employeeId/caps')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  findCapsByEmployee(@Param('employeeId') employeeId: string) {
    return this.employerService.findCapsByEmployee(employeeId);
  }

  @Patch('caps/:capId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  updateEmployeeCap(
    @Param('capId') capId: string,
    @Body() updateEmployeeCapDto: UpdateEmployeeCapDto,
    @Request() req: any,
  ) {
    return this.employerService.updateEmployeeCap(capId, updateEmployeeCapDto, req.user.sub);
  }

  @Delete('caps/:capId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HR_MANAGER)
  removeEmployeeCap(@Param('capId') capId: string, @Request() req: any) {
    return this.employerService.removeEmployeeCap(capId, req.user.sub);
  }
}