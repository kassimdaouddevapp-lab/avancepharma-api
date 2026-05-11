import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { AuditService } from '../audit/audit.service';
import { TokenPair, JwtPayload, AuditAction } from '@avancepharma/shared';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private auditService: AuditService,
  ) {}

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Generate tokens
    const tokenPair = await this.generateTokenPair(user);

    // Store refresh token in Redis
    const refreshTokenId = uuidv4();
    await this.redisService.set(
      `refresh:${user.id}:${refreshTokenId}`,
      tokenPair.refreshToken,
      7 * 24 * 60 * 60, // 7 days
    );

    // Audit log
    this.auditService.log(
      AuditAction.LOGIN,
      user.id,
      'User',
      user.id,
      undefined,
      { email: user.email },
    );

    return tokenPair;
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.jwtService.verify<JwtPayload & { jti: string }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if refresh token is blacklisted
      const storedToken = await this.redisService.get(`refresh:${payload.sub}:${payload.jti}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new ForbiddenException('Invalid refresh token');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new ForbiddenException('User not found or inactive');
      }

      // Remove old refresh token
      await this.redisService.del(`refresh:${payload.sub}:${payload.jti}`);

      // Generate new token pair
      return this.generateTokenPair(user);
    } catch (error) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify<JwtPayload & { jti: string }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.sub === userId) {
        await this.redisService.del(`refresh:${userId}:${payload.jti}`);
      }

      // Audit log
      this.auditService.log(
        AuditAction.LOGOUT,
        userId,
        'User',
        userId,
      );
    } catch (error) {
      // Ignore invalid tokens during logout
    }
  }

  private async generateTokenPair(user: any): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      pharmacyId: user.pharmacyId || undefined,
      employerId: user.employerId || undefined,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshTokenId = uuidv4();
    const refreshToken = this.jwtService.sign(
      { ...payload, jti: refreshTokenId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );

    return { accessToken, refreshToken };
  }
}
