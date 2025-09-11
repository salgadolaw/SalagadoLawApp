import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Paginated, User } from '../models/user.model';
import { OptionDto } from '../models/option-dto';

@Injectable({
  providedIn: 'root'
})
export class Users {

  private http = inject(HttpClient);
  private base = environment.apiBaseUrl.replace(/\/+$/, ''); // Remove trailing slashes


  list(params: {
    page: number; pageSize: number;
    sort?: string; order?: 'asc' | 'desc';
    search?: string;
  }): Observable<Paginated<User>> {

    let q = new HttpParams()
      .set('page', params.page)
      .set('pageSize', params.pageSize);
    if (params.sort) q = q.set('sort', params.sort);
    if (params.order) q = q.set('order', params.order);
    if (params.search) q = q.set('search', params.search);

    return this.http.get<Paginated<User>>(`${this.base}/users`, { params: q });
  }

  create(payload: Partial<User>) {
    console.log(payload);
    return this.http.post<User>(`${this.base}/users`, payload);
  }

  update(id: string, payload: Partial<User>) {
console.log(payload);
    return this.http.put<User>(`${this.base}/4cf4c0b6-7bcc-474e-94e1-0d53e908a3a2/users/${id}`, payload);
  }
  inactivate(id: string) {
return this.http.patch<void>(`${this.base}/765eeb20-b57f-4e3a-aa48-8c8486a03fe6/users/${id}/inactivate`, {});
  }

  assigRoles(id: string, roles: string[]) {

    return this.http.patch<User>(`${this.base}/84fd5a5c-ebfa-4af1-b305-389af2b13d19/users/${id}/roles`, { roles });
  }

  getOptionsStates(): Observable<OptionDto[]>{
    return this.http.get<OptionDto[]>(`${this.base}/states`);
  }


}
