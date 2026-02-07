import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../../auth/models/role.enum';

export const roleGuard = (requiredRoles: Role[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const user = auth.getUser();

    if (!auth.isLoggedIn() || !user) {
      return router.createUrlTree(['/']);
    }

    if (requiredRoles.includes(user.role)) {
      return true;
    }

    return router.createUrlTree(['/dashboard']);
  };
};
