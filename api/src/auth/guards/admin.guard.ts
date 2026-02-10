import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { auth } from '../auth.js';
import { Role } from '../enums/role.enum.js';
import { AuthUser } from '../interfaces/auth-user.interface.js';

interface AuthRequest extends Request {
  user?: AuthUser;
}

type SessionResponse = { session: unknown; user: AuthUser } | null;

type AuthApi = {
  api: {
    getSession: (args: {
      headers?: Record<string, string>;
    }) => Promise<SessionResponse>;
  };
};

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const headers = this.normalizeHeaders(request.headers);
    const authApi = auth as AuthApi;

    const session = await authApi.api.getSession({ headers });
    if (!session?.user) {
      throw new UnauthorizedException('Missing session');
    }

    request.user = session.user;

    if (session.user.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }

  private normalizeHeaders(
    headers: Record<string, string | string[] | undefined>,
  ): Record<string, string> {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (!value) continue;
      normalized[key] = Array.isArray(value) ? value.join(',') : value;
    }
    return normalized;
  }
}
