import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { EnvModule } from 'src/env/env.module';

@Module({
  imports: [EnvModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
