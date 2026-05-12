import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const dbOptions = databaseUrl
          ? (() => {
              const url = new URL(databaseUrl);
              return {
                host: url.hostname,
                port: parseInt(url.port || '5432', 10),
                username: url.username,
                password: url.password,
                database: url.pathname.replace(/^\//, ''),
              };
            })()
          : {
              host: configService.get<string>('DB_HOST', 'localhost'),
              port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
              database: configService.get<string>('DB_NAME', 'avancepharma'),
              username: configService.get<string>('DB_USER', 'avancepharma_user'),
              password: configService.get<string>('DB_PASS', 'avancepharma_pass'),
            };

        return {
          type: 'postgres',
          ...dbOptions,
          autoLoadEntities: true,
          synchronize: false,
          logging: process.env.NODE_ENV === 'development',
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
