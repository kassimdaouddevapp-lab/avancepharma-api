import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TransactionStatus } from '@avancepharma/shared';
import { Employee } from '../employer/employee.entity';
import { Pharmacy } from '../pharmacy/pharmacy.entity';
import { User } from '../users/user.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId!: string;

  @Column({ type: 'uuid', name: 'pharmacy_id' })
  pharmacyId!: string;

  @Column({ type: 'uuid', name: 'pharmacy_agent_id', nullable: true })
  pharmacyAgentId!: string | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'requested_amount',
  })
  requestedAmount!: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'approved_amount',
    nullable: true,
  })
  approvedAmount!: string | null;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'timestamp', name: 'transaction_date' })
  transactionDate!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: Date | null;

  // Relations
  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @ManyToOne(() => Pharmacy)
  @JoinColumn({ name: 'pharmacy_id' })
  pharmacy!: Pharmacy;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'pharmacy_agent_id' })
  pharmacyAgent!: User | null;
}