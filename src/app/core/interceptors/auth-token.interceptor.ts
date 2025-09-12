import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenService);
  const router = inject(Router);

  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  const jwt = token.getToken();
  const authReq = jwt
  ? req.clone({ setHeaders: {Authorization: `Bearer ${jwt}`}})
  : req;

  return next(authReq).pipe(
    catchError(( err: HttpErrorResponse) => {
      if(err.status === 401){
        token.clear();
        router.navigate(['/auth/login'], { replaceUrl: true });
      }
     return throwError(() => err);
    })
  )

  /*const isPublicAuth = /\/auth\/(login|forgot|reset)(\?|$)/.test(req.url);
  if (!isPublicAuth && token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    console.log('authTokenInterceptor',req)
  }
  return next(req);*/
};
