import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Roles {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl.replace(/\/+$/, ''); // Remove trailing slashes

  list(): Observable<Roles[]> {

    return this.http.get<Roles[]>(`${this.base}/roles`);
  }


}
