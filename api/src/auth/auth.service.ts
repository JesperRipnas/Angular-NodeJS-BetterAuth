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
        username: 'admin',
        password: '1234',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        birthDate: '1990-01-01',
        role: Role.ADMIN,
      },
      {
        username: 'user',
        password: '1234',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        birthDate: '1995-06-15',
        role: Role.USER,
      },
      {
        username: 'seller',
        password: '1234',
        email: 'seller@example.com',
        firstName: 'Store',
        lastName: 'Seller',
        birthDate: '1988-11-20',
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
