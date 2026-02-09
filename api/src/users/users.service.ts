import { Injectable } from '@nestjs/common';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class UsersService {
  // Mock data for now - will be replaced with database queries later
  private users: AuthUser[] = [
    {
      uuid: '0f2b4a2e-3b9a-4e0a-a98d-8f4f5d2f9a01',
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      birthDate: '1990-01-01',
      role: Role.ADMIN,
      verifiedEmail: true,
    },
    {
      uuid: '7c5f5c3b-5f8a-46c7-9b1a-3fdc1c2f1d04',
      username: 'john_doe',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      birthDate: '1992-05-15',
      role: Role.USER,
      verifiedEmail: false,
    },
    {
      uuid: '2f7a9b1a-6d2d-4e1f-9d3a-2b6d1f9e4a05',
      username: 'seller_jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      birthDate: '1988-11-22',
      role: Role.SELLER,
      verifiedEmail: false,
    },
    {
      uuid: '2f7a9b1a-6d2d-4e1f-9d3a-2b6d1f9e4a23',
      username: 'seller_jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      birthDate: '1988-11-22',
      role: Role.SELLER,
      verifiedEmail: false,
    },
    {
      uuid: '2f7a9b1a-6d2d-4e1f-9d3a-2b6d1f9e4a02',
      username: 'seller_jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      birthDate: '1988-11-22',
      role: Role.SELLER,
      verifiedEmail: false,
    },
    {
      uuid: '2f7a9b1a-6d2d-4e1f-9d3a-2b6d1f9e4a02',
      username: 'seller_jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      birthDate: '1988-11-22',
      role: Role.SELLER,
      verifiedEmail: false,
    },
    {
      uuid: '2f7a9b1a-6d2d-4e1f-9d3a-2b6d1f9e4a02',
      username: 'seller_jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      birthDate: '1988-11-22',
      role: Role.SELLER,
      verifiedEmail: false,
    },
    {
      uuid: '2f7a9b1a-6d2d-4e1f-9d3a-2b6d1f9e4a02',
      username: 'seller_jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      birthDate: '1988-11-22',
      role: Role.SELLER,
      verifiedEmail: false,
    },
    {
      uuid: '2f7a9b1a-6d2d-4e1f-9d3a-2b6d1f9e4a02',
      username: 'seller_jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      birthDate: '1988-11-22',
      role: Role.SELLER,
      verifiedEmail: false,
    },
    {
      uuid: '2f7a9b1a-6d2d-4e1f-9d3a-2b6d1f9e4a02',
      username: 'seller_jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      birthDate: '1988-11-22',
      role: Role.SELLER,
      verifiedEmail: false,
    },
    {
      uuid: '2f7a9b1a-6d2d-4e1f-9d3a-2b6d1f9e4a02',
      username: 'seller_jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      birthDate: '1988-11-22',
      role: Role.SELLER,
      verifiedEmail: false,
    },
    {
      uuid: '2f7a9b1a-6d2d-4e1f-9d3a-2b6d1f9e4a02',
      username: 'seller_jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      birthDate: '1988-11-22',
      role: Role.SELLER,
      verifiedEmail: false,
    },
    {
      uuid: '2f7a9b1a-6d2d-4e1f-9d3a-2b6d1f9e4a02',
      username: 'seller_jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      birthDate: '1988-11-22',
      role: Role.SELLER,
      verifiedEmail: false,
    },
    {
      uuid: '2f7a9b1a-6d2d-4e1f-9d3a-2b6d1f9e4a02',
      username: 'seller_jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      birthDate: '1988-11-22',
      role: Role.SELLER,
      verifiedEmail: false,
    },
  ];

  // NEEDS TO CHECK FOR AUTHORIZATION BOTH IN CLIENT & SERVER
  getUsers(): AuthUser[] {
    return this.users;
  }

  getUserById(uuid: string): AuthUser | undefined {
    return this.users.find((user) => user.uuid === uuid);
  }

  updateUser(
    uuid: string,
    updateData: Partial<AuthUser>,
  ): AuthUser | undefined {
    const index = this.users.findIndex((user) => user.uuid === uuid);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updateData };
      return this.users[index];
    }
    return undefined;
  }

  deleteUser(uuid: string): boolean {
    const index = this.users.findIndex((user) => user.uuid === uuid);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}
