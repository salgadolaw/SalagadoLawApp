import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { Menu } from '../services/menu';
import { TokenService } from '../services/token.service';

export const roleGuard: CanMatchFn = (route: Route, _segments: UrlSegment[]) => {

  const token = inject(TokenService);
  const _route = inject(Router);


 if (!token.isAuthenticated()) {
    return _route.createUrlTree(['/auth/login']);
  }

const required = (route.data?.['roles'] as string[] | undefined) ?? [];
  if (required.length === 0) return true;


   const claims = token.getClaims() ?? {};
  const have: string[] =
    Array.isArray(claims.roles) ? claims.roles :
    Array.isArray((claims as any).authorities) ? (claims as any).authorities :
    [];

    const need = required.map(r => r.toLowerCase());
  const got  = have.map(r => String(r).toLowerCase());

  const ok = need.some(r => got.includes(r));
  return ok ? true : _route.createUrlTree(['/dashboard/home']);


  /*codigo inicial
 const menu = inject(Menu);
 const router = inject(Router);
 const need = (route.data?.['roles'] as string[]) || [];
const have = menu.roles();
const ok = need.length === 0 || need.some(r => have.includes(r));
return ok ? true : router.createUrlTree(['/']);
*/

};
