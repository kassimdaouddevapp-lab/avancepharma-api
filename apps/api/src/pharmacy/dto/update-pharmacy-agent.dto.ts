import { PartialType } from '@nestjs/mapped-types';
import { CreatePharmacyAgentDto } from './create-pharmacy-agent.dto';

export class UpdatePharmacyAgentDto extends PartialType(CreatePharmacyAgentDto) {}