import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { CreatePharmacyAgentDto } from './dto/create-pharmacy-agent.dto';
import { UpdatePharmacyAgentDto } from './dto/update-pharmacy-agent.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@avancepharma/shared';

@Controller('pharmacies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createPharmacyDto: CreatePharmacyDto, @Request() req: any) {
    return this.pharmacyService.create(createPharmacyDto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN, UserRole.PHARMACY_AGENT)
  findAll(@Request() req: any) {
    // Si c'est un agent, retourner seulement ses pharmacies
    if (req.user.role === UserRole.PHARMACY_AGENT) {
      return this.pharmacyService.findByAgent(req.user.sub);
    }
    return this.pharmacyService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN, UserRole.PHARMACY_AGENT)
  findOne(@Param('id') id: string) {
    return this.pharmacyService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updatePharmacyDto: UpdatePharmacyDto,
    @Request() req: any,
  ) {
    return this.pharmacyService.update(id, updatePharmacyDto, req.user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.pharmacyService.remove(id, req.user.sub);
  }

  // Agent management routes
  @Post(':pharmacyId/agents')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN)
  addAgent(
    @Param('pharmacyId') pharmacyId: string,
    @Body() createPharmacyAgentDto: CreatePharmacyAgentDto,
    @Request() req: any,
  ) {
    // Override pharmacyId from URL
    createPharmacyAgentDto.pharmacyId = pharmacyId;
    return this.pharmacyService.addAgent(createPharmacyAgentDto, req.user.sub);
  }

  @Get(':pharmacyId/agents')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN, UserRole.PHARMACY_AGENT)
  getAgentsByPharmacy(@Param('pharmacyId') pharmacyId: string) {
    return this.pharmacyService.findAgentsByPharmacy(pharmacyId);
  }

  @Patch('agents/:agentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN)
  updateAgent(
    @Param('agentId') agentId: string,
    @Body() updatePharmacyAgentDto: UpdatePharmacyAgentDto,
    @Request() req: any,
  ) {
    return this.pharmacyService.updateAgent(agentId, updatePharmacyAgentDto, req.user.sub);
  }

  @Delete('agents/:agentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.PHARMACY_ADMIN)
  removeAgent(@Param('agentId') agentId: string, @Request() req: any) {
    return this.pharmacyService.removeAgent(agentId, req.user.sub);
  }
}