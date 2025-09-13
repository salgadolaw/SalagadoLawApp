import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { catchError, delay, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { TokenService } from './token.service';

export type ResetResult =
  | { ok: true }
  | { ok: false, reason: 'expired' | 'NotFound' };


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokens = inject(TokenService);
  private base = environment.apiBaseUrl.replace(/\/+$/, ''); // Remove trailing slashes




  login(email: string, password: string) {

    //return this.http.post<{ accessToken: string }>(`${this.base}/auth/login`, { email, password });
return this.http.post<{ token: string }>(`${this.base}/auth/login`, { email, password })
.pipe(
  tap(({ token }) => {
     this.tokens.setToken(token);
  })
)
;
  }

  forgot(email: string) {

    return this.http.post<boolean>(`${this.base}/auth/forgot`,
      { email },
      { observe: 'response' }).pipe(
        map(res => ({ ok: res.status === 200 || res.status === 204 })),
        catchError(() => of({ ok: false }))
      );
  }

  resetPassword(code: string, password: string): Observable<ResetResult> {
console.log(this.base)
    return this.http.post(
      `${this.base}/auth/reset`,
      { code, password },
      { observe: 'response' as const}
    ).pipe(
      map((res: HttpResponse<any>): ResetResult =>
          res.status === 200
            ? { ok: true }
            : { ok: false, reason: 'NotFound' }
        ),
      catchError((err: HttpErrorResponse) =>
        of<ResetResult>(err.status === 410
          ? { ok: false, reason: 'expired' }
          : { ok: false, reason: 'NotFound' }
        )

      )

    );
  }

   reset(code: string, password: string): Observable<ResetResult> {
    return this.resetPassword(code, password);
  }



  storeSession(token: string | null) {
    this.tokens.setAccessToken(token);
  }

  logOut() {
    this.tokens.clear();
  }


}
