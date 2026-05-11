import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { AuditAction, UserRole } from '@avancepharma/shared';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true, name: 'actor_id' })
  actorId!: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: true,
    name: 'actor_role',
  })
  actorRole!: UserRole | null;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action!: AuditAction;

  @Column({ type: 'varchar', length: 255, name: 'entity_name' })
  entityName!: string;

  @Column({ type: 'uuid', nullable: true, name: 'entity_id' })
  entityId!: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'previous_state' })
  previousState!: any | null;

  @Column({ type: 'jsonb', nullable: true, name: 'new_state' })
  newState!: any | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'ip_address' })
  ipAddress!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
