import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@avancepharma/shared';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}