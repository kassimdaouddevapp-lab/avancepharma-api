import { PartialType } from '@nestjs/mapped-types';
import { CreatePharmacyDto } from './create-pharmacy.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePharmacyDto extends PartialType(CreatePharmacyDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}