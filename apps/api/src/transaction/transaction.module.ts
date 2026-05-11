import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { AuditModule } from '../audit/audit.module';
import { EmployerModule } from '../employer/employer.module';
import { PharmacyModule } from '../pharmacy/pharmacy.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    AuditModule,
    EmployerModule,
    PharmacyModule,
    UsersModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}