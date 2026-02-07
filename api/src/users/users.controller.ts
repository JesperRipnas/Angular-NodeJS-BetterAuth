import {
  Controller,
  Get,
  Param,
  Put,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthUser } from '../auth/interfaces/auth-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getUsers(): AuthUser[] {
    return this.usersService.getUsers();
  }

  // NEEDS TO CHECK FOR AUTHORIZATION BOTH IN CLIENT & SERVER
  @Get(':username')
  @HttpCode(HttpStatus.OK)
  getUser(@Param('username') username: string): AuthUser {
    const user = this.usersService.getUserByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }
    return user;
  }

  @Put(':username')
  @HttpCode(HttpStatus.OK)
  updateUser(
    @Param('username') username: string,
    @Body() updateData: Partial<AuthUser>,
  ): AuthUser {
    if (!username) {
      throw new BadRequestException('Username is required');
    }

    const updatedUser = this.usersService.updateUser(username, updateData);
    if (!updatedUser) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }
    return updatedUser;
  }

  @Delete(':username')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('username') username: string): void {
    if (!username) {
      throw new BadRequestException('Username is required');
    }

    const deleted = this.usersService.deleteUser(username);
    if (!deleted) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }
  }
}
