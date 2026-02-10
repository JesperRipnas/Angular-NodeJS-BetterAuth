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
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { AuthUser } from '../auth/interfaces/auth-user.interface.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async getUsers(): Promise<AuthUser[]> {
    return this.usersService.getUsers();
  }

  @Get('check-username')
  @HttpCode(HttpStatus.OK)
  async checkUsername(
    @Query('username') username: string,
  ): Promise<{ available: boolean }> {
    if (!username) {
      return { available: false };
    }

    const available = await this.usersService.isUsernameAvailable(username);
    return { available };
  }

  @Get('check-email')
  @HttpCode(HttpStatus.OK)
  async checkEmail(
    @Query('email') email: string,
  ): Promise<{ available: boolean }> {
    if (!email) {
      return { available: false };
    }

    const available = await this.usersService.isEmailAvailable(email);
    return { available };
  }

  // NEEDS TO CHECK FOR AUTHORIZATION BOTH IN CLIENT & SERVER
  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async getUser(@Param('uuid') uuid: string): Promise<AuthUser> {
    const user = await this.usersService.getUserById(uuid);
    if (!user) {
      throw new NotFoundException(`User with id "${uuid}" not found`);
    }
    return user;
  }

  @Put(':uuid')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async updateUser(
    @Param('uuid') uuid: string,
    @Body() updateData: Partial<AuthUser>,
  ): Promise<AuthUser> {
    if (!uuid) {
      throw new BadRequestException('User id is required');
    }

    // Username: only letters and numbers
    if (updateData.username !== undefined && updateData.username !== null) {
      const usernamePattern = /^[a-zA-Z0-9]+$/;
      if (!usernamePattern.test(updateData.username.trim())) {
        throw new BadRequestException(
          'Username can only contain letters and numbers',
        );
      }
    }
    // Firstname/Lastname: allow Unicode letters, diacritics, hyphens, spaces and apostrophes
    if (updateData.firstName !== undefined && updateData.firstName !== null) {
      if (!this.isNameValid(updateData.firstName)) {
        throw new BadRequestException('First name can only contain letters');
      }
    }

    if (updateData.lastName !== undefined && updateData.lastName !== null) {
      if (!this.isNameValid(updateData.lastName)) {
        throw new BadRequestException('Last name can only contain letters');
      }
    }

    const updatedUser = await this.usersService.updateUser(uuid, updateData);
    if (!updatedUser) {
      throw new NotFoundException(`User with id "${uuid}" not found`);
    }
    return updatedUser;
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminGuard)
  async deleteUser(@Param('uuid') uuid: string): Promise<void> {
    if (!uuid) {
      throw new BadRequestException('User id is required');
    }

    const deleted = await this.usersService.deleteUser(uuid);
    if (!deleted) {
      throw new NotFoundException(`User with id "${uuid}" not found`);
    }
  }

  // Validate names with Unicode-aware regex when available; fallback to
  // accented Latin-range. Allows letters, combining marks, spaces, hyphens and apostrophes.
  private isNameValid(value: string | null | undefined): boolean {
    const normalized = (value ?? '').toString().trim();
    if (!normalized) return false;
    try {
      const pattern = /^\p{L}[\p{L}\p{M}' -]*$/u;
      return pattern.test(normalized);
    } catch {
      const fallback = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]*$/;
      return fallback.test(normalized);
    }
  }
}
