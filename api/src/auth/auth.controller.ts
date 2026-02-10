import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Res,
  Req,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import type { QueryResult } from 'pg';
import { authDatabase } from './auth.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<unknown> {
    const identifier = loginDto.identifier?.trim();
    const password = loginDto.password?.trim();

    if (!identifier || !password) {
      throw new BadRequestException('Missing login credentials');
    }

    let email = identifier;
    if (!identifier.includes('@')) {
      const result: QueryResult<{ email: string }> = await authDatabase.query(
        'SELECT "email" FROM "user" WHERE LOWER("username") = $1 LIMIT 1',
        [identifier.toLowerCase()],
      );
      email = result.rows[0]?.email;
      if (!email) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    const baseUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
    const origin = req.headers.origin ?? baseUrl;
    const response = await fetch(new URL('/api/auth/sign-in/email', baseUrl), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin,
      },
      body: JSON.stringify({ email, password, rememberMe: true }),
    });

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('set-cookie', setCookie);
    }

    let payload: unknown = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }

    if (!response.ok) {
      let message = 'Invalid credentials';
      if (payload && typeof payload === 'object' && 'message' in payload) {
        const maybe = payload as Record<string, unknown>;
        if (typeof maybe.message === 'string') {
          message = maybe.message;
        }
      }
      throw new UnauthorizedException(message);
    }

    return payload;
  }
}
