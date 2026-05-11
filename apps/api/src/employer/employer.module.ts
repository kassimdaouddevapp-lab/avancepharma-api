import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employer } from './employer.entity';
import { Employee } from './employee.entity';
import { EmployeeCap } from './employee-cap.entity';
import { EmployerService } from './employer.service';
import { EmployerController } from './employer.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employer, Employee, EmployeeCap]),
    AuditModule,
  ],
  controllers: [EmployerController],
  providers: [EmployerService],
  exports: [EmployerService],
})
export class EmployerModule {}