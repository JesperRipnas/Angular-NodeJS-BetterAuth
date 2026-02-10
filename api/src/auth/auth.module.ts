import { Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth.js';
import { AuthMigrationsService } from './auth.migrations.service.js';
import { AuthController } from './auth.controller.js';

@Module({
  imports: [BetterAuthModule.forRoot(auth)],
  controllers: [AuthController],
  providers: [AuthMigrationsService],
})
export class AuthModule {}
