import Joi from 'joi';
import path from 'node:path';
import { Request, Response, NextFunction } from 'express';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { CommonModule } from './common/common.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '..', '.env'),
      ],
      // this can maybe be replaced using a custom DTO with class-validator instead of joi
      validationSchema: Joi.object({
        ENABLE_HTTP_LOGS: Joi.boolean().default(true),
        DATABASE_HOST: Joi.string().hostname().required(),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        BETTER_AUTH_SECRET: Joi.string()
          .min(32)
          .default('dev_better_auth_secret_32_chars_min'),
        BETTER_AUTH_URL: Joi.string().default('http://localhost:3000'),
      }),
    }),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
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
