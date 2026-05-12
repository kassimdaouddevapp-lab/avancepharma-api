import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Employer } from './employer.entity';
import { User } from '../users/user.entity';
import { EmployeeCap } from './employee-cap.entity';

@Entity('employees')
@Index(['employerId', 'matricule'], { unique: true })
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'employer_id' })
  employerId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 50 })
  matricule!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'qr_code_secret' })
  qrCodeSecret!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: Date | null;

  @ManyToOne(() => Employer, (employer) => employer.employees)
  employer!: Employer;

  @OneToOne(() => User)
  user!: User;

  @OneToMany(() => EmployeeCap, (cap) => cap.employee)
  caps!: EmployeeCap[];
}
