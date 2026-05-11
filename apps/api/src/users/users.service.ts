import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction, UserRole } from '@avancepharma/shared';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private auditService: AuditService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'role', 'isActive', 'lastLoginAt', 'createdAt', 'updatedAt'],
    });
  }

  async create(createUserDto: CreateUserDto, createdBy: string): Promise<User> {
    // Check if email already exists
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = this.usersRepository.create({
      email: createUserDto.email,
      passwordHash: hashedPassword,
      role: createUserDto.role,
      isActive: true,
    });

    const savedUser = await this.usersRepository.save(user);

    // Audit log
    await this.auditService.log(
      AuditAction.CREATE,
      createdBy,
      'User',
      savedUser.id,
      undefined,
      { email: savedUser.email, role: savedUser.role },
    );

    return savedUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto, updatedBy: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const oldValues = {
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    // Audit log
    await this.auditService.log(
      AuditAction.UPDATE,
      updatedBy,
      'User',
      id,
      oldValues,
      {
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    );

    return updatedUser;
  }

  async remove(id: string, deletedBy: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const oldValues = {
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    await this.usersRepository.softDelete(id);

    // Audit log
    await this.auditService.log(
      AuditAction.DELETE,
      deletedBy,
      'User',
      id,
      oldValues,
      undefined,
    );
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);

    await this.usersRepository.update(id, {
      passwordHash: hashedNewPassword,
      updatedAt: new Date(),
    });

    // Audit log
    await this.auditService.log(
      AuditAction.UPDATE,
      id,
      'User',
      id,
      { passwordChanged: true },
      { passwordChanged: true },
    );
  }

  async resetPassword(id: string, resetPasswordDto: ResetPasswordDto, resetBy: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 12);

    await this.usersRepository.update(id, {
      passwordHash: hashedPassword,
      updatedAt: new Date(),
    });

    // Audit log
    await this.auditService.log(
      AuditAction.UPDATE,
      resetBy,
      'User',
      id,
      { passwordReset: true },
      { passwordReset: true },
    );
  }

  async activateUser(id: string, activatedBy: string): Promise<User> {
    return this.update(id, { isActive: true }, activatedBy);
  }

  async deactivateUser(id: string, deactivatedBy: string): Promise<User> {
    return this.update(id, { isActive: false }, deactivatedBy);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLoginAt: new Date() });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.usersRepository.find({
      where: { role, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }
}
