import { BadRequestException, Injectable } from '@nestjs/common';
import type { QueryResult } from 'pg';
import { AuthUser } from '../auth/interfaces/auth-user.interface.js';
// Role enum intentionally unused in this service
import { authDatabase } from '../auth/auth.js';

@Injectable()
export class UsersService {
  private readonly defaultCreatedAt = '2024-01-01T00:00:00Z';

  private readonly pool = authDatabase;

  private readonly selectFields = `
    "id" AS "uuid",
    "username",
    "email",
    "firstName",
    "lastName",
    "birthDate",
    "createdAt",
    "updatedAt",
    "emailVerified" AS "verifiedEmail",
    "role"
  `;

  // NEEDS TO CHECK FOR AUTHORIZATION BOTH IN CLIENT & SERVER
  async getUsers(): Promise<AuthUser[]> {
    const result: QueryResult<AuthUser> = await this.pool.query(
      `SELECT ${this.selectFields} FROM "user" ORDER BY "createdAt" DESC`,
    );
    return result.rows.map((user) => this.normalizeUserDates(user));
  }

  async getUserById(uuid: string): Promise<AuthUser | undefined> {
    const result: QueryResult<AuthUser> = await this.pool.query(
      `SELECT ${this.selectFields} FROM "user" WHERE "id" = $1 LIMIT 1`,
      [uuid],
    );
    const user = result.rows[0];
    return user ? this.normalizeUserDates(user) : undefined;
  }

  async isUsernameAvailable(
    username: string,
    excludeId?: string,
  ): Promise<boolean> {
    const normalized = this.normalizeUsername(username);
    if (!normalized) {
      return false;
    }

    const params: string[] = [normalized];
    let query = `SELECT "id" FROM "user" WHERE LOWER("username") = $1`;
    if (excludeId) {
      params.push(excludeId);
      query += ` AND "id" <> $2`;
    }
    query += ' LIMIT 1';

    const result = await this.pool.query(query, params);
    return (result.rowCount ?? 0) === 0;
  }

  async isEmailAvailable(email: string, excludeId?: string): Promise<boolean> {
    const normalized = this.normalizeEmail(email);
    if (!normalized) {
      return false;
    }

    const params: string[] = [normalized];
    let query = `SELECT "id" FROM "user" WHERE LOWER("email") = $1`;
    if (excludeId) {
      params.push(excludeId);
      query += ` AND "id" <> $2`;
    }
    query += ' LIMIT 1';

    const result = await this.pool.query(query, params);
    return (result.rowCount ?? 0) === 0;
  }

  async updateUser(
    uuid: string,
    updateData: Partial<AuthUser>,
  ): Promise<AuthUser | undefined> {
    const normalizedUsername = updateData.username?.trim();
    if (normalizedUsername) {
      const available = await this.isUsernameAvailable(
        normalizedUsername,
        uuid,
      );
      if (!available) {
        throw new BadRequestException('Username already exists');
      }
    }

    const fields: string[] = [];
    const values: Array<string | boolean | null> = [];
    const setField = (column: string, value: string | boolean | null) => {
      fields.push(`"${column}" = $${values.length + 1}`);
      values.push(value);
    };

    if (updateData.username !== undefined) {
      setField('username', updateData.username?.trim() || null);
    }
    if (updateData.email !== undefined) {
      setField('email', updateData.email?.trim() || null);
    }
    if (updateData.firstName !== undefined) {
      setField('firstName', updateData.firstName?.trim() || null);
    }
    if (updateData.lastName !== undefined) {
      setField('lastName', updateData.lastName?.trim() || null);
    }
    if (updateData.birthDate !== undefined) {
      setField('birthDate', updateData.birthDate || null);
    }
    if (updateData.role !== undefined) {
      setField('role', updateData.role);
    }
    if (updateData.verifiedEmail !== undefined) {
      setField('emailVerified', updateData.verifiedEmail);
    }

    if (fields.length === 0) {
      return this.getUserById(uuid);
    }

    setField('updatedAt', new Date().toISOString());
    values.push(uuid);

    const result: QueryResult<AuthUser> = await this.pool.query(
      `UPDATE "user" SET ${fields.join(', ')} WHERE "id" = $${values.length} RETURNING ${this.selectFields}`,
      values,
    );

    const updated = result.rows[0];
    return updated ? this.normalizeUserDates(updated) : undefined;
  }

  private normalizeUserDates(user: AuthUser): AuthUser {
    return {
      ...user,
      createdAt: user.createdAt || this.defaultCreatedAt,
    };
  }

  private normalizeUsername(value: string | null | undefined): string {
    return value?.trim().toLowerCase() ?? '';
  }

  private normalizeEmail(value: string | null | undefined): string {
    return value?.trim().toLowerCase() ?? '';
  }

  async deleteUser(uuid: string): Promise<boolean> {
    const result = await this.pool.query(`DELETE FROM "user" WHERE "id" = $1`, [
      uuid,
    ]);
    return (result.rowCount ?? 0) > 0;
  }
}
