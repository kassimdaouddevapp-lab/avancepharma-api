import { IsUUID, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreatePharmacyAgentDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsUUID()
  @IsNotEmpty()
  pharmacyId!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}