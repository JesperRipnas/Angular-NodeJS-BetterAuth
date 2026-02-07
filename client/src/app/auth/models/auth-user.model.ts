import { Role } from './role.enum';

export interface AuthUser {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  verifiedEmail: boolean;
  role: Role;
}
