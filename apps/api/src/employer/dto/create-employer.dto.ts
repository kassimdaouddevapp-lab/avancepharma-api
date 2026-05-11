import { IsString, IsOptional, IsNotEmpty, MaxLength, IsEmail } from 'class-validator';

export class CreateEmployerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  sector?: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail!: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;
}