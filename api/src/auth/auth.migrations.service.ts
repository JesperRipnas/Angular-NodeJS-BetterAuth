import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { getMigrations } from 'better-auth/db';
import type { QueryResult } from 'pg';
import { auth, authConfig, authDatabase, seedUsers } from './auth.js';

type MigrationsResult = {
  toBeAdded: unknown[];
  toBeCreated: unknown[];
  runMigrations: () => Promise<void>;
};

type SignUpEmailBody = {
  name: string;
  email: string;
  password: string;
  username?: string;
};

type AuthApi = {
  api: {
    signUpEmail: (args: { body: SignUpEmailBody }) => Promise<unknown>;
  };
};

@Injectable()
export class AuthMigrationsService implements OnModuleInit {
  private readonly logger = new Logger(AuthMigrationsService.name);

  async onModuleInit(): Promise<void> {
    this.logger.log(
      `Better Auth DB target: ${process.env.DATABASE_HOST ?? 'localhost'}:${process.env.DATABASE_PORT ?? 5432}/${process.env.DATABASE_NAME ?? 'app_db'} (user: ${process.env.DATABASE_USER ?? 'app_user'})`,
    );
    const getMigrationsTyped = getMigrations as (
      config: typeof authConfig,
    ) => Promise<MigrationsResult>;
    const migrations = await getMigrationsTyped(authConfig);
    const { toBeAdded, toBeCreated, runMigrations } = migrations;

    if (toBeAdded.length > 0 || toBeCreated.length > 0) {
      this.logger.log(
        `Running Better Auth migrations (create: ${toBeCreated.length}, add: ${toBeAdded.length})`,
      );

      await runMigrations();
      this.logger.log('Better Auth migrations completed.');
    } else {
      this.logger.log('No Better Auth migrations pending.');
    }

    await this.ensureSeedUsers();
  }

  private async ensureSeedUsers(): Promise<void> {
    for (const seedUser of seedUsers) {
      const exists = await this.userExists(seedUser.email);
      if (exists) {
        continue;
      }

      const authApi = auth as AuthApi;
      await authApi.api.signUpEmail({
        body: {
          name: seedUser.name,
          email: seedUser.email,
          password: seedUser.password,
          username: seedUser.username,
        },
      });
    }
  }

  private async userExists(email: string): Promise<boolean> {
    const pool = authDatabase;
    const result: QueryResult<{ id: string }> = await pool.query(
      'SELECT id FROM "user" WHERE email = $1 LIMIT 1',
      [email],
    );
    const rowCount = result.rowCount ?? 0;
    return rowCount > 0;
  }
}
