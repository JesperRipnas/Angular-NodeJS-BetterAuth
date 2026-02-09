import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from './interfaces/auth-user.interface';
import { Role } from './enums/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = () => ({
    validateUser: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useFactory: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(
      AuthService,
    ) as jest.Mocked<AuthService>;
  });

  it('returns user payload on valid credentials', () => {
    const dto: LoginDto = { username: 'admin', password: '1234' };
    const user: AuthUser = {
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      birthDate: '1990-01-01',
      createdAt: '2024-01-05T09:10:00Z',
      updatedAt: '2025-01-12T12:30:00Z',
      role: Role.ADMIN,
      verifiedEmail: true,
      uuid: '0f2b4a2e-3b9a-4e0a-a98d-8f4f5d2f9a01',
    };

    authService.validateUser.mockReturnValue(user);

    const authHeader =
      'Basic ' +
      Buffer.from(`${dto.username}:${dto.password}`).toString('base64');
    const result = controller.login(authHeader);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authService.validateUser).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ success: true, user });
  });

  it('throws UnauthorizedException on invalid credentials', () => {
    const dto: LoginDto = { username: 'wrong', password: 'creds' };
    authService.validateUser.mockImplementation(() => {
      throw new UnauthorizedException('Invalid credentials');
    });

    const authHeader =
      'Basic ' +
      Buffer.from(`${dto.username}:${dto.password}`).toString('base64');

    expect(() => controller.login(authHeader)).toThrow(UnauthorizedException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authService.validateUser).toHaveBeenCalledWith(dto);
  });
});
