import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get all users', () => {
    const users = service.getUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  it('should get a user by username', () => {
    const user = service.getUserById('0f2b4a2e-3b9a-4e0a-a98d-8f4f5d2f9a01');
    expect(user).toBeDefined();
    expect(user?.username).toBe('admin');
  });

  it('should return undefined for non-existent user', () => {
    const user = service.getUserById('nonexistent');
    expect(user).toBeUndefined();
  });
});
