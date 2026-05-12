import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = parseInt(this.configService.get<string>('REDIS_PORT', '6379'), 10);

    this.redis = redisUrl
      ? new Redis(redisUrl)
      : new Redis({
          host: redisHost,
          port: redisPort,
        });

    this.redis.on('error', (err) => {
      console.error('Redis error:', err);
    });

    this.redis.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  async set(key: string, value: string | object, ttlSeconds?: number): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, stringValue);
    } else {
      await this.redis.set(key, stringValue);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async del(key: string): Promise<number> {
    return this.redis.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.redis.exists(key);
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  getClient(): Redis {
    return this.redis;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
