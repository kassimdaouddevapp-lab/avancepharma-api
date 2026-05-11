import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePharmacyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  registrationNumber?: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;
}