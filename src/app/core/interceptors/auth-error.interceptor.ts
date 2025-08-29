import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const isPublicAuth = /\/auth\/(login|forgot|reset)(\?|$)/.test(req.url);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isPublicAuth) {
        auth.logOut();
        router.navigateByUrl('/auth/login');
      }
      return throwError(() => err);
    })
  );
};
