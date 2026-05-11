import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Employee } from './employee.entity';

@Entity('employee_caps')
export class EmployeeCap {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId!: string;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    name: 'monthly_cap_amount',
  })
  monthlyCapAmount!: string;

  @Column({ type: 'date', name: 'valid_from' })
  validFrom!: Date;

  @Column({ type: 'date', name: 'valid_to', nullable: true })
  validTo!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => Employee, (employee) => employee.caps)
  employee!: Employee;
}
