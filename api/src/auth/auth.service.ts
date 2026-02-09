import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from './interfaces/auth-user.interface';
import { Role } from './enums/role.enum';

interface MockUser extends AuthUser {
  password: string;
}

@Injectable()
export class AuthService {
  validateUser(loginDto: LoginDto): AuthUser {
    const { username, password } = loginDto;

    // MOCK USERS, REPLACE WITH FIREBASE LOGIC LATER
    const mockUsers: MockUser[] = [
      {
        uuid: '0f2b4a2e-3b9a-4e0a-a98d-8f4f5d2f9a01',
        username: 'admin',
        password: '1234',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        birthDate: '1990-01-01',
        createdAt: '2024-01-05T09:10:00Z',
        updatedAt: '2025-01-12T12:30:00Z',
        verifiedEmail: true,
        role: Role.ADMIN,
      },
      {
        uuid: '9b9a23a2-60aa-4d6b-9d0b-41d2c1d2a0a2',
        username: 'user',
        password: '1234',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        birthDate: '1995-06-15',
        createdAt: '2024-02-10T14:20:00Z',
        updatedAt: '2025-01-02T08:15:00Z',
        verifiedEmail: true,
        role: Role.USER,
      },
      {
        uuid: '0d3f7f6c-6c8f-4f0b-9db6-5bdb23a7b0c3',
        username: 'seller',
        password: '1234',
        email: 'seller@example.com',
        firstName: 'Store',
        lastName: 'Seller',
        birthDate: '1988-11-20',
        createdAt: '2024-03-18T10:00:00Z',
        updatedAt: '2025-02-01T16:45:00Z',
        verifiedEmail: false,
        role: Role.SELLER,
      },
    ];

    const match = mockUsers.find(
      (user) => user.username === username && user.password === password,
    );

    if (match) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...user } = match;
      return user;
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
