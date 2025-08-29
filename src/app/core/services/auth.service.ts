import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { delay, of } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http= inject(HttpClient);
  private tokens= inject(TokenService);
 private  base = environment.apiBaseUrl.replace(/\/+$/,''); // Remove trailing slashes



    login(email: string, password: string) {

      return this.http.post<{ accessToken: string }>(`${this.base}/auth/login`, { email, password });

    }

    forgot(email: string){
      if(environment.auth?.mock){
        return of({ok: true}).pipe(delay(300));
      }
      return this.http.post<boolean>(`${this.base}/auth/forgot`, { email });
    }

    reset(token: string, newPassword: string){
      if(environment.auth?.mock){
        return of({ok: true}).pipe(delay(300));
      }
      return this.http.post<boolean>(`${this.base}/auth/reset`, { token, newPassword });
    }

    storeSession(token: string | null){
      this.tokens.setAccessToken(token);
    }

    logOut(){
      this.tokens.clear();
    }


}
