import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { EnvService } from 'src/env/env.service';

@Injectable()
export class RedisService {
  private client: RedisClientType;

  constructor(private readonly envService: EnvService) {
    this.client = createClient({
      url: this.envService.get('REDIS_URL'),
    });

    this.client
      .connect()
      .catch((err) => console.error('Erro ao conectar no Redis:', err));
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    await this.client.set(key, value, { EX: ttl });
  }
}

