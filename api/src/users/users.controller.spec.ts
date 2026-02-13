import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all users', () => {
    const users = controller.getUsers();
    expect(Array.isArray(users)).toBe(true);
  });

  it('should get a user by username', () => {
    const user = controller.getUser('0f2b4a2e-3b9a-4e0a-a98d-8f4f5d2f9a01');
    expect(user).toBeDefined();
    expect(user.username).toBe('admin');
  });
});
