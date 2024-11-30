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
import { AppLoggerModule } from 'src/utils/logger/app-logger.module';

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
              heartbeatIntervalInSeconds: Number(
                envService.get('RABBITMQ_HEARTBEAT_INTERVAL_IN_SECONDS'),
              ),
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
    AppLoggerModule,
  ],
  controllers: [RabbitMQController],
  providers: [RabbitMQService],
  exports: [RabbitMQService, ClientsModule],
})
export class RabbitMQModule {}
