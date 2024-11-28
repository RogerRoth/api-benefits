import { Module } from '@nestjs/common';
import { BenefitsController } from './benefits.controller';
import { BenefitsService } from './benefits.service';
import { AuthModule } from 'src/auth/auth.module';
import { EnvModule } from 'src/env/env.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [AuthModule, EnvModule, HttpModule],
  controllers: [BenefitsController],
  providers: [BenefitsService],
})
export class BenefitsModule {}
