import { IsUUID, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTransactionDto {
  @IsUUID()
  @IsNotEmpty()
  employeeId!: string;

  @IsUUID()
  @IsNotEmpty()
  pharmacyId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  requestedAmount!: number;

  @IsDateString()
  transactionDate!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}