import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  Index,
} from 'typeorm';
import { Pharmacy } from './pharmacy.entity';
import { User } from '../users/user.entity';

@Entity('pharmacy_agents')
@Index(['userId', 'pharmacyId'], { unique: true })
export class PharmacyAgent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'pharmacy_id' })
  pharmacyId!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ManyToOne(() => Pharmacy, (pharmacy) => pharmacy.agents)
  pharmacy!: Pharmacy;

  @OneToOne(() => User)
  user!: User;
}
