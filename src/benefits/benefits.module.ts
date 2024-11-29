import { Module } from '@nestjs/common';
import { BenefitsController } from './benefits.controller';
import { BenefitsService } from './benefits.service';
import { EnvModule } from 'src/env/env.module';
import { SearchModule } from 'src/search/search.module';
import { RedisModule } from 'src/redis/redis.module';
import { RabbitMQModule } from 'src/rabbitMQ/rabbitmq.module';

@Module({
  imports: [EnvModule, SearchModule, RedisModule, RabbitMQModule],
  controllers: [BenefitsController],
  providers: [BenefitsService],
})
export class BenefitsModule {}
