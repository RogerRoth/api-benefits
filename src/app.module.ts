import { Module } from '@nestjs/common';
import { BenefitsModule } from './benefits/benefits.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env/env';
import { EnvModule } from './env/env.module';

@Module({
  imports: [
    BenefitsModule,
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
  ],
})
export class AppModule {}
