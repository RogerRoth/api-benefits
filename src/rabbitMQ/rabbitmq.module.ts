import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { SearchModule } from '../search/search.module';
import { EnvModule } from 'src/env/env.module';
import { EnvService } from 'src/env/env.service';
import { RabbitMQService } from './rabbitmq.service';
import { RedisModule } from 'src/redis/redis.module';
import { RabbitMQController } from './rabbitmq.controller';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [EnvModule],
        useFactory: async (envService: EnvService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [envService.get('RABBITMQ_URL')],
            queue: envService.get('RABBITMQ_QUEUE'),
            queueOptions: {
              durable: true,
            },
            socketOptions: {
              heartbeatIntervalInSeconds: 900,
            },
          },
        }),
        inject: [EnvService],
      },
    ]),
    EnvModule,
    RedisModule,
    SearchModule,
    AuthModule,
    HttpModule,
  ],
  controllers: [RabbitMQController],
  providers: [RabbitMQService],
  exports: [RabbitMQService, ClientsModule],
})
export class RabbitMQModule {}

