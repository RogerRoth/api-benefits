import { Module } from '@nestjs/common';
import { BenefitsModule } from './benefits/benefits.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';
import { RabbitMQModule } from './rabbitMQ/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    BenefitsModule,
    RabbitMQModule,
  ],
})
export class AppModule {}
