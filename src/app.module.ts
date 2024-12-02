import { Module } from '@nestjs/common';
import { BenefitsModule } from './benefits/benefits.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';
import { RabbitMQModule } from './rabbitMQ/rabbitmq.module';
import { AppController } from './app.controller';

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
  controllers: [AppController],
})
export class AppModule {}
