import { computed, Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

type jwtClaim = {
  sub?: string;
  email?: string;
  roles?: string[];
  exp?: number; // segundos epoch
  nbf?: number;
  iat?: number;
  iss?: string;
  aud?: string;
  [k: string]: any;
};
const KEY = 'access_token';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private accessToken: string | null = null;
  private _token= signal<string | null>(null);
   claims =signal<jwtClaim | null>(null);


  setAccessToken(token: string | null) {
    this.accessToken = token;

    if (token) {
      localStorage.setItem(KEY, token);
    } else {
      localStorage.removeItem(KEY);
    }
  }

  restore() {
    const t = localStorage.getItem(KEY);
    this.accessToken = t || null;
    if (t && !this.isAuthenticated()) {
      this.clear();
    }
  }

  getAccessToken(): string | null {

    console.log('getAccessToken',this.accessToken)
    return this.accessToken;
  }

isAuthenticated = computed(()=> {
   const t = this._token();
   const c = this.claims();
   if(!t || !c) return false;
   const now = Math.floor(Date.now() / 1000);
   if (c.nbf && now < c.nbf) return false;
    if (c.exp && now >= c.exp) return false;
    return true;
})

constructor(){
  const stored = localStorage.getItem('auth_token');
    if (stored) {
      this._token.set(stored);
      this.claims.set(this.decodeJwt(stored));
    }
}

setToken(jwt:string){
  localStorage.setItem('auth_token', jwt);
    this._token.set(jwt);
    this.claims.set(this.decodeJwt(jwt));
}

clear(){
  localStorage.removeItem('auth_token');
    this._token.set(null);
    this.claims.set(null);
}

getToken(): string | null {
    return this._token();
  }

  getClaims(): jwtClaim | null {
    return this.claims();
  }

private decodeJwt(token: string): jwtClaim | null {
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}


/*isAuthenticated(): boolean {
  const t = this.accessToken;

  if (!t) return false;
  try {
    const claims = jwtDecode<jwtClaim>(t);

    if (!claims.exp) return false;
    return claims.exp * 1000 > Date.now();

  } catch { return false; }

}

getClaims(): jwtClaim | null {
  if (!this.accessToken) return null;
  try {
    console.log(jwtDecode<jwtClaim>(this.accessToken))
    return jwtDecode<jwtClaim>(this.accessToken);
  } catch { return null; }

}

clear() {
 this.setAccessToken(null);
}
*/
}
