import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { EmployerModule } from './employer/employer.module';
import { TransactionModule } from './transaction/transaction.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    UsersModule,
    PharmacyModule,
    EmployerModule,
    TransactionModule,
    HealthModule,
  ],
})
export class AppModule {}
