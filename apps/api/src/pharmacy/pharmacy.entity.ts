import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { PharmacyAgent } from './pharmacy-agent.entity';

@Entity('pharmacies')
@Index(['registrationNumber'], { unique: true, where: 'registration_number IS NOT NULL' })
export class Pharmacy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'registration_number' })
  registrationNumber!: string | null;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: Date | null;

  @OneToMany(() => PharmacyAgent, (agent) => agent.pharmacy)
  agents!: PharmacyAgent[];
}
