import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class UsersService {
  private readonly defaultCreatedAt = '2024-01-01T00:00:00Z';

  // Mock data for now - will be replaced with database queries later
  private users: AuthUser[] = [
    {
      uuid: 'a1f3c2b4-7f9c-4f10-9b2a-10b8f8c2d101',
      username: 'admin_olivia',
      email: 'olivia.admin@example.com',
      firstName: 'Olivia',
      lastName: 'Berg',
      birthDate: '1987-03-14',
      createdAt: '2025-02-08T09:15:00Z',
      updatedAt: '2025-02-08T12:20:00Z',
      role: Role.ADMIN,
      verifiedEmail: true,
    },
    {
      uuid: 'b2d4a6c8-1c7f-4d02-9e31-9a7b2f0c1102',
      username: 'admin_viktor',
      email: 'viktor.admin@example.com',
      firstName: 'Viktor',
      lastName: 'Lind',
      birthDate: '1984-11-02',
      createdAt: '2024-12-15T08:10:00Z',
      updatedAt: '2025-01-05T15:45:00Z',
      role: Role.ADMIN,
      verifiedEmail: true,
    },
    {
      uuid: 'c3e7b9d1-2b4a-4f25-8a64-5a7f3c2d1203',
      username: 'admin_nora',
      email: 'nora.admin@example.com',
      firstName: 'Nora',
      lastName: 'Sund',
      birthDate: '1990-07-22',
      createdAt: '2024-11-03T10:35:00Z',
      updatedAt: '2024-12-01T09:20:00Z',
      role: Role.ADMIN,
      verifiedEmail: true,
    },
    {
      uuid: 'd4f1a3b5-3c5e-4a21-9f55-7b6c4d2e1304',
      username: 'liam_j',
      email: 'liam.johansson@example.com',
      firstName: 'Liam',
      lastName: 'Johansson',
      birthDate: '1993-05-09',
      createdAt: '2024-10-21T14:05:00Z',
      updatedAt: '2024-11-19T11:30:00Z',
      role: Role.USER,
      verifiedEmail: true,
    },
    {
      uuid: 'e5c2b4a6-4d6f-41b0-9a26-6d5e3c2f1405',
      username: 'emma_s',
      email: 'emma.svensson@example.com',
      firstName: 'Emma',
      lastName: 'Svensson',
      birthDate: '1995-08-18',
      createdAt: '2024-09-12T07:50:00Z',
      updatedAt: '2024-10-02T16:10:00Z',
      role: Role.USER,
      verifiedEmail: false,
    },
    {
      uuid: 'f6a3c5b7-5e70-4c12-8b37-5c4d3e2f1506',
      username: 'noah_k',
      email: 'noah.karlsson@example.com',
      firstName: 'Noah',
      lastName: 'Karlsson',
      birthDate: '1991-12-27',
      createdAt: '2024-08-05T12:00:00Z',
      updatedAt: '',
      role: Role.USER,
      verifiedEmail: true,
    },
    {
      uuid: 'a7b4d6c8-6f81-4d23-9c48-4b3a2f1e1607',
      username: 'ava_m',
      email: 'ava.magnusson@example.com',
      firstName: 'Ava',
      lastName: 'Magnusson',
      birthDate: '1996-01-30',
      createdAt: '2024-07-19T09:40:00Z',
      updatedAt: '2024-08-03T08:55:00Z',
      role: Role.USER,
      verifiedEmail: false,
    },
    {
      uuid: 'b8c5e7d9-7082-4f34-8d59-3a2b1c0d1708',
      username: 'elias_p',
      email: 'elias.pettersson@example.com',
      firstName: 'Elias',
      lastName: 'Pettersson',
      birthDate: '1989-04-11',
      createdAt: '2024-06-08T06:25:00Z',
      updatedAt: '2024-07-14T13:05:00Z',
      role: Role.USER,
      verifiedEmail: true,
    },
    {
      uuid: 'c9d6f8e0-8193-4a45-9e60-2a1b0c9d1809',
      username: 'mia_l',
      email: 'mia.larsson@example.com',
      firstName: 'Mia',
      lastName: 'Larsson',
      birthDate: '1992-09-03',
      createdAt: '2024-05-16T10:10:00Z',
      updatedAt: '',
      role: Role.USER,
      verifiedEmail: true,
    },
    {
      uuid: 'd0e7a9f1-92a4-4b56-8f71-1a0b9c8d1910',
      username: 'lucas_h',
      email: 'lucas.holm@example.com',
      firstName: 'Lucas',
      lastName: 'Holm',
      birthDate: '1986-06-25',
      createdAt: '2024-04-02T15:30:00Z',
      updatedAt: '2024-04-20T12:15:00Z',
      role: Role.USER,
      verifiedEmail: false,
    },
    {
      uuid: 'e1f8b0a2-a3b5-4c67-9a82-0b9a8d7c2011',
      username: 'seller_elin',
      email: 'elin.seller@example.com',
      firstName: 'Elin',
      lastName: 'Nyberg',
      birthDate: '1990-02-12',
      createdAt: '2024-03-10T08:05:00Z',
      updatedAt: '2024-03-28T17:35:00Z',
      role: Role.SELLER,
      verifiedEmail: true,
    },
    {
      uuid: 'f2a9c1b3-b4c6-4d78-8b93-9c8b7a6d2112',
      username: 'seller_oliver',
      email: 'oliver.seller@example.com',
      firstName: 'Oliver',
      lastName: 'Ek',
      birthDate: '1985-10-19',
      createdAt: '2024-02-14T11:45:00Z',
      updatedAt: '',
      role: Role.SELLER,
      verifiedEmail: false,
    },
    {
      uuid: 'a3b0d2c4-c5d7-4e89-9a04-8b7a6c5d2213',
      username: 'seller_isak',
      email: 'isak.seller@example.com',
      firstName: 'Isak',
      lastName: 'Hall',
      birthDate: '1988-01-07',
      createdAt: '2024-01-29T07:25:00Z',
      updatedAt: '2024-02-12T14:50:00Z',
      role: Role.SELLER,
      verifiedEmail: true,
    },
    {
      uuid: 'b4c1e3d5-d6e8-4f90-8b15-7a6b5c4d2314',
      username: 'seller_sara',
      email: 'sara.seller@example.com',
      firstName: 'Sara',
      lastName: 'Lund',
      birthDate: '1993-03-21',
      createdAt: '2023-12-18T10:00:00Z',
      updatedAt: '2024-01-04T09:30:00Z',
      role: Role.SELLER,
      verifiedEmail: true,
    },
    {
      uuid: 'c5d2f4e6-e7f9-4a01-9c26-6a5b4c3d2415',
      username: 'anna_w',
      email: 'anna.west@example.com',
      firstName: 'Anna',
      lastName: 'West',
      birthDate: '1994-12-05',
      createdAt: '2023-11-11T13:20:00Z',
      updatedAt: '',
      role: Role.USER,
      verifiedEmail: true,
    },
    {
      uuid: 'd6e3a5f7-f809-4b12-8d37-5a4b3c2d2516',
      username: 'erik_s',
      email: 'erik.strom@example.com',
      firstName: 'Erik',
      lastName: 'Strom',
      birthDate: '1987-08-09',
      createdAt: '2023-10-06T06:55:00Z',
      updatedAt: '2023-10-28T18:05:00Z',
      role: Role.USER,
      verifiedEmail: false,
    },
    {
      uuid: 'e7f4b6a8-0a1b-4c23-9e48-4a3b2c1d2617',
      username: 'maja_k',
      email: 'maja.kristoffersen@example.com',
      firstName: 'Maja',
      lastName: 'Kristoffersen',
      birthDate: '1991-01-26',
      createdAt: '2023-09-19T12:40:00Z',
      updatedAt: '',
      role: Role.USER,
      verifiedEmail: true,
    },
    {
      uuid: 'f8a5c7b9-1b2c-4d34-8f59-3a2b1c0d2718',
      username: 'leo_n',
      email: 'leo.nilsson@example.com',
      firstName: 'Leo',
      lastName: 'Nilsson',
      birthDate: '1989-02-16',
      createdAt: '2023-08-14T09:05:00Z',
      updatedAt: '2023-09-01T10:10:00Z',
      role: Role.USER,
      verifiedEmail: false,
    },
    {
      uuid: 'a9b6d8c0-2c3d-4e45-9a60-2b1c0d9e2819',
      username: 'ida_r',
      email: 'ida.rosen@example.com',
      firstName: 'Ida',
      lastName: 'Rosen',
      birthDate: '1997-04-08',
      createdAt: '2023-07-02T14:15:00Z',
      updatedAt: '2023-07-20T16:25:00Z',
      role: Role.USER,
      verifiedEmail: true,
    },
    {
      uuid: 'b0c7e9d1-3d4e-4f56-8b71-1c0d9e8f2920',
      username: 'hanna_g',
      email: 'hanna.gustafsson@example.com',
      firstName: 'Hanna',
      lastName: 'Gustafsson',
      birthDate: '1992-06-30',
      createdAt: '2023-06-11T08:00:00Z',
      updatedAt: '',
      role: Role.USER,
      verifiedEmail: false,
    },
  ];

  // NEEDS TO CHECK FOR AUTHORIZATION BOTH IN CLIENT & SERVER
  getUsers(): AuthUser[] {
    return this.users.map((user) => this.normalizeUserDates(user));
  }

  getUserById(uuid: string): AuthUser | undefined {
    const user = this.users.find((user) => user.uuid === uuid);
    return user ? this.normalizeUserDates(user) : undefined;
  }

  updateUser(
    uuid: string,
    updateData: Partial<AuthUser>,
  ): AuthUser | undefined {
    const index = this.users.findIndex((user) => user.uuid === uuid);
    if (index !== -1) {
      const normalizedUsername = updateData.username?.trim().toLowerCase();
      if (normalizedUsername) {
        const isDuplicate = this.users.some(
          (user, userIndex) =>
            userIndex !== index &&
            user.username.trim().toLowerCase() === normalizedUsername,
        );
        if (isDuplicate) {
          throw new BadRequestException('Username already exists');
        }
      }
      const existing = this.users[index];
      this.users[index] = {
        ...existing,
        ...updateData,
        createdAt: existing.createdAt || this.defaultCreatedAt,
        updatedAt: new Date().toISOString(),
      };
      return this.normalizeUserDates(this.users[index]);
    }
    return undefined;
  }

  private normalizeUserDates(user: AuthUser): AuthUser {
    return {
      ...user,
      createdAt: user.createdAt || this.defaultCreatedAt,
    };
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
