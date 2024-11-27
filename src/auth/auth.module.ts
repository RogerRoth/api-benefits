import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from './auth.service';
import { EnvModule } from '../env/env.module';

@Module({
  imports: [HttpModule, EnvModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

