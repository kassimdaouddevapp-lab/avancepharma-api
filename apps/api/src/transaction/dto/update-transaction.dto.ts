import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';
import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { TransactionStatus } from '@avancepharma/shared';
import { Transform } from 'class-transformer';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  approvedAmount?: number;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;
}