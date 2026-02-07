import * as Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
      // this can maybe be replaced using a custom DTO with class-validator instead of joi
      validationSchema: Joi.object({
        ENABLE_HTTP_LOGS: Joi.boolean().required(),
        DATABASE_HOST: Joi.string().hostname().required(),
        DATBASE_PORT: Joi.number().default(5432),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
      }),
    }),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppsModule implements NestModule {
  constructor(private readonly configService: ConfigService) {
    // comment just to avoid lint error
  }
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction): any => {
        const middleware = new LoggerMiddleware(this.configService);
        middleware.use(req, res, next);
      })
      .forRoutes('*');
  }
}
