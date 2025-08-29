import { CanMatchFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { inject } from '@angular/core';

export const guestGuard: CanMatchFn = (route, segments) => {
  const tokens = inject(TokenService);
  const router = inject(Router);
  if(!tokens.isAuthenticated()) return true;
  router.navigate(['/']);
  return false;
};
