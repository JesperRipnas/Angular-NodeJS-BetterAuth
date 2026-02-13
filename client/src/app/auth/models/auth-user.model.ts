import { Role } from './role.enum';

export interface AuthUser {
  uuid: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  createdAt: string;
  updatedAt: string;
  verifiedEmail: boolean;
  role: Role;
}
