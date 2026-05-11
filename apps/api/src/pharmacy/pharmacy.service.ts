import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pharmacy } from './pharmacy.entity';
import { PharmacyAgent } from './pharmacy-agent.entity';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { CreatePharmacyAgentDto } from './dto/create-pharmacy-agent.dto';
import { UpdatePharmacyAgentDto } from './dto/update-pharmacy-agent.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '@avancepharma/shared';

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
    @InjectRepository(PharmacyAgent)
    private pharmacyAgentRepository: Repository<PharmacyAgent>,
    private auditService: AuditService,
  ) {}

  async create(createPharmacyDto: CreatePharmacyDto, userId: string): Promise<Pharmacy> {
    const pharmacy = this.pharmacyRepository.create(createPharmacyDto);
    const savedPharmacy = await this.pharmacyRepository.save(pharmacy);

    // Audit log
    await this.auditService.log(
      AuditAction.CREATE,
      userId,
      'Pharmacy',
      savedPharmacy.id,
      undefined,
      { name: savedPharmacy.name, address: savedPharmacy.address },
    );

    return savedPharmacy;
  }

  async findAll(): Promise<Pharmacy[]> {
    return this.pharmacyRepository.find({
      relations: ['agents'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Pharmacy> {
    const pharmacy = await this.pharmacyRepository.findOne({
      where: { id },
      relations: ['agents', 'agents.user'],
    });

    if (!pharmacy) {
      throw new NotFoundException(`Pharmacy with ID ${id} not found`);
    }

    return pharmacy;
  }

  async update(id: string, updatePharmacyDto: UpdatePharmacyDto, userId: string): Promise<Pharmacy> {
    const pharmacy = await this.findOne(id);
    const oldValues = {
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone,
      isActive: pharmacy.isActive,
    };

    Object.assign(pharmacy, updatePharmacyDto);
    const updatedPharmacy = await this.pharmacyRepository.save(pharmacy);

    // Audit log
    await this.auditService.log(
      AuditAction.UPDATE,
      userId,
      'Pharmacy',
      id,
      oldValues,
      {
        name: updatedPharmacy.name,
        address: updatedPharmacy.address,
        phone: updatedPharmacy.phone,
        isActive: updatedPharmacy.isActive,
      },
    );

    return updatedPharmacy;
  }

  async remove(id: string, userId: string): Promise<void> {
    const pharmacy = await this.findOne(id);
    const oldValues = {
      name: pharmacy.name,
      address: pharmacy.address,
      isActive: pharmacy.isActive,
    };

    await this.pharmacyRepository.softDelete(id);

    // Audit log
    await this.auditService.log(
      AuditAction.DELETE,
      userId,
      'Pharmacy',
      id,
      oldValues,
      undefined,
    );
  }

  async findByAgent(agentId: string): Promise<Pharmacy[]> {
    return this.pharmacyRepository
      .createQueryBuilder('pharmacy')
      .innerJoin('pharmacy.agents', 'agent')
      .where('agent.userId = :agentId', { agentId })
      .andWhere('agent.isActive = true')
      .andWhere('pharmacy.isActive = true')
      .getMany();
  }

  // Agent management methods
  async addAgent(createPharmacyAgentDto: CreatePharmacyAgentDto, userId: string): Promise<PharmacyAgent> {
    // Check if agent already exists for this pharmacy
    const existingAgent = await this.pharmacyAgentRepository.findOne({
      where: {
        userId: createPharmacyAgentDto.userId,
        pharmacyId: createPharmacyAgentDto.pharmacyId,
      },
    });

    if (existingAgent) {
      throw new BadRequestException('Agent already exists for this pharmacy');
    }

    const agent = this.pharmacyAgentRepository.create(createPharmacyAgentDto);
    const savedAgent = await this.pharmacyAgentRepository.save(agent);

    // Audit log
    await this.auditService.log(
      AuditAction.CREATE,
      userId,
      'PharmacyAgent',
      savedAgent.id,
      undefined,
      { userId: savedAgent.userId, pharmacyId: savedAgent.pharmacyId },
    );

    return savedAgent;
  }

  async updateAgent(id: string, updatePharmacyAgentDto: UpdatePharmacyAgentDto, userId: string): Promise<PharmacyAgent> {
    const agent = await this.pharmacyAgentRepository.findOne({
      where: { id },
      relations: ['pharmacy', 'user'],
    });

    if (!agent) {
      throw new NotFoundException(`Pharmacy agent with ID ${id} not found`);
    }

    const oldValues = {
      userId: agent.userId,
      pharmacyId: agent.pharmacyId,
      isActive: agent.isActive,
    };

    Object.assign(agent, updatePharmacyAgentDto);
    const updatedAgent = await this.pharmacyAgentRepository.save(agent);

    // Audit log
    await this.auditService.log(
      AuditAction.UPDATE,
      userId,
      'PharmacyAgent',
      id,
      oldValues,
      {
        userId: updatedAgent.userId,
        pharmacyId: updatedAgent.pharmacyId,
        isActive: updatedAgent.isActive,
      },
    );

    return updatedAgent;
  }

  async removeAgent(id: string, userId: string): Promise<void> {
    const agent = await this.pharmacyAgentRepository.findOne({
      where: { id },
      relations: ['pharmacy', 'user'],
    });

    if (!agent) {
      throw new NotFoundException(`Pharmacy agent with ID ${id} not found`);
    }

    const oldValues = {
      userId: agent.userId,
      pharmacyId: agent.pharmacyId,
      isActive: agent.isActive,
    };

    await this.pharmacyAgentRepository.remove(agent);

    // Audit log
    await this.auditService.log(
      AuditAction.DELETE,
      userId,
      'PharmacyAgent',
      id,
      oldValues,
      undefined,
    );
  }

  async findAgentsByPharmacy(pharmacyId: string): Promise<PharmacyAgent[]> {
    return this.pharmacyAgentRepository.find({
      where: { pharmacyId },
      relations: ['user', 'pharmacy'],
      order: { createdAt: 'DESC' },
    });
  }
}