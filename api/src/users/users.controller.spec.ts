import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

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
    const user = controller.getUser('admin');
    expect(user).toBeDefined();
    expect(user.username).toBe('admin');
  });
});
