import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@avancepharma/shared';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createUserDto: CreateUserDto, @Request() req: any) {
    return this.usersService.create(createUserDto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.sub);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    return this.usersService.update(id, updateUserDto, req.user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.usersService.remove(id, req.user.sub);
  }

  // Password management
  @Put('change-password')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: any,
  ) {
    return this.usersService.changePassword(req.user.sub, changePasswordDto);
  }

  @Put(':id/reset-password')
  @Roles(UserRole.SUPER_ADMIN)
  resetPassword(
    @Param('id') id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
    @Request() req: any,
  ) {
    return this.usersService.resetPassword(id, resetPasswordDto, req.user.sub);
  }

  // Account status management
  @Put(':id/activate')
  @Roles(UserRole.SUPER_ADMIN)
  activateUser(@Param('id') id: string, @Request() req: any) {
    return this.usersService.activateUser(id, req.user.sub);
  }

  @Put(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN)
  deactivateUser(@Param('id') id: string, @Request() req: any) {
    return this.usersService.deactivateUser(id, req.user.sub);
  }

  // Role-based queries
  @Get('role/:role')
  @Roles(UserRole.SUPER_ADMIN)
  findByRole(@Param('role') role: UserRole) {
    return this.usersService.findByRole(role);
  }
}