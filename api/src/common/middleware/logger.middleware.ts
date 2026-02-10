import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly enableLogs: boolean;

  constructor(private readonly configService: ConfigService) {
    const value = this.configService.get<string | boolean>('ENABLE_HTTP_LOGS');
    this.enableLogs = value !== false && value !== 'false';
  }

  use(req: Request, res: Response, next: NextFunction): void {
    if (!this.enableLogs) {
      next();
      return;
    }
    const { method, originalUrl } = req;
    const clientIp = this.getClientIp(req);
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;

      this.logger.log(
        `${clientIp} ${method} ${originalUrl} ${statusCode} - ${duration}ms`,
      );
    });

    next();
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'Unknown'
    );
  }
}
