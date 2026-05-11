import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployerDto } from './create-employer.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEmployerDto extends PartialType(CreateEmployerDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}