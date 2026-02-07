import { Injectable } from '@nestjs/common';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class UsersService {
  // Mock data for now - will be replaced with database queries later
  private users: AuthUser[] = [
    {
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      birthDate: '1990-01-01',
      role: Role.ADMIN,
    },
    {
      username: 'john_doe',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      birthDate: '1992-05-15',
      role: Role.USER,
    },
    {
      username: 'seller_jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      birthDate: '1988-11-22',
      role: Role.SELLER,
    },
  ];

  // NEEDS TO CHECK FOR AUTHORIZATION BOTH IN CLIENT & SERVER
  getUsers(): AuthUser[] {
    return this.users;
  }

  getUserByUsername(username: string): AuthUser | undefined {
    return this.users.find((user) => user.username === username);
  }

  updateUser(
    username: string,
    updateData: Partial<AuthUser>,
  ): AuthUser | undefined {
    const index = this.users.findIndex((user) => user.username === username);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updateData };
      return this.users[index];
    }
    return undefined;
  }

  deleteUser(username: string): boolean {
    const index = this.users.findIndex((user) => user.username === username);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}
