import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { Pool } from 'pg';
import { Role } from './enums/role.enum.js';

type SeedUser = {
  email: string;
  password: string;
  name: string;
  username: string;
  role: Role;
};

export const seedUsers: SeedUser[] = [
  {
    email: 'admin@example.com',
    password: '1234',
    name: 'Admin User',
    username: 'admin',
    role: Role.ADMIN,
  },
  {
    email: 'user@example.com',
    password: '1234',
    name: 'Regular User',
    username: 'user',
    role: Role.USER,
  },
  {
    email: 'seller@example.com',
    password: '1234',
    name: 'Seller User',
    username: 'seller',
    role: Role.SELLER,
  },
];

const seedRoleByEmail = new Map(
  seedUsers.map((seedUser) => [seedUser.email, seedUser.role]),
);

export const authDatabase = new Pool({
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  user: process.env.DATABASE_USER ?? 'app_user',
  password: process.env.DATABASE_PASSWORD ?? 'app_password',
  database: process.env.DATABASE_NAME ?? 'app_db',
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const authDatabaseProvider =
  authDatabase as unknown as BetterAuthOptions['database'];

export const authConfig: BetterAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  database: authDatabaseProvider,
  secret:
    process.env.BETTER_AUTH_SECRET ?? 'dev_better_auth_secret_32_chars_min',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  trustedOrigins: ['http://localhost:4200', '*'],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 4,
  },
  user: {
    additionalFields: {
      username: {
        type: 'string',
        required: false,
      },
      firstName: {
        type: 'string',
        required: false,
      },
      lastName: {
        type: 'string',
        required: false,
      },
      birthDate: {
        type: 'string',
        required: false,
      },
      gender: {
        type: 'string',
        required: false,
      },
      role: {
        type: [Role.ADMIN, Role.USER, Role.SELLER],
        required: false,
        defaultValue: Role.USER,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (
          user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            emailVerified: boolean;
            name: string;
            image?: string | null;
          } & Record<string, unknown>,
        ) => {
          const email = user.email ?? '';
          const role = seedRoleByEmail.get(email) ?? Role.USER;
          const usernameFromPayload =
            typeof user.username === 'string' ? user.username : undefined;
          const username = usernameFromPayload ?? email.split('@')[0];
          const normalizedUsername = username.trim().toLowerCase();

          if (normalizedUsername) {
            const existing = await authDatabase.query(
              'SELECT id FROM "user" WHERE LOWER("username") = $1 LIMIT 1',
              [normalizedUsername],
            );
            if ((existing.rowCount ?? 0) > 0) {
              throw new Error('Username already exists');
            }
          }

          return {
            data: {
              ...user,
              role,
              username,
            },
          };
        },
      },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
};

export const auth = betterAuth(authConfig);
