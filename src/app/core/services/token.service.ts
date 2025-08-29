import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

type jwtClaim = { exp?: number; email?: string; name?: string;[k: string]: any };
const KEY = 'access_token';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private accessToken: string | null = null;

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
    return this.accessToken;
  }

  isAuthenticated(): boolean {
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
      return jwtDecode<jwtClaim>(this.accessToken);
    } catch { return null; }

  }

  clear() {
   this.setAccessToken(null);
  }

}
