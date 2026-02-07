import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

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
    const user = service.getUserByUsername('admin');
    expect(user).toBeDefined();
    expect(user?.username).toBe('admin');
  });

  it('should return undefined for non-existent user', () => {
    const user = service.getUserByUsername('nonexistent');
    expect(user).toBeUndefined();
  });
});
