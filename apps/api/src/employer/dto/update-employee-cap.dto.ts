import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeCapDto } from './create-employee-cap.dto';

export class UpdateEmployeeCapDto extends PartialType(CreateEmployeeCapDto) {}