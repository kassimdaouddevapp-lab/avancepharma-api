import { IsUUID, IsNotEmpty, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEmployeeCapDto {
  @IsUUID()
  @IsNotEmpty()
  employeeId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  monthlyCapAmount!: number;

  @IsDateString()
  validFrom!: string;

  @IsDateString()
  @IsOptional()
  validTo?: string;
}