import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditAction } from '@avancepharma/shared';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    action: AuditAction,
    userId: string,
    entityType: string,
    entityId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      actorId: userId,
      action,
      entityName: entityType,
      entityId,
      previousState: oldValues,
      newState: newValues,
      ipAddress: metadata?.ipAddress,
    });

    await this.auditLogRepository.save(auditLog);
  }
}