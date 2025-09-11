import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = () => {
  const tokenSvc = inject(TokenService);
  const router = inject(Router);
  if (tokenSvc.isAuthenticated()) return true;

  router.navigate(['/auth/login']);
  return false;
};
