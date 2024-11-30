import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { EnvService } from 'src/env/env.service';
import { RedisConnectionException } from './exceptions/redis-connection.exception';
import { RedisOperationException } from './exceptions/redis-operation.exception';

@Injectable()
export class RedisService {
  private client: RedisClientType;

  constructor(private readonly envService: EnvService) {
    this.client = createClient({
      url: this.envService.get('REDIS_URL'),
    });

    this.client.connect().catch((err) => {
      throw new RedisConnectionException(err.message);
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      return this.client.get(key);
    } catch (error) {
      throw new RedisOperationException('get', key, error.message);
    }
  }

  async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    try {
      await this.client.set(key, value, { EX: ttl });
    } catch (error) {
      throw new RedisOperationException('get', key, error.message);
    }
  }
}
