import { computed, Injectable, signal } from '@angular/core';
import { MenuItem, MenuItemApi } from '../models/menu.model';
import { BehaviorSubject, catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { TokenService } from './token.service';



@Injectable({
  providedIn: 'root'
})
export class Menu {
  private roles_: string[] = [];
  private menu$ = new BehaviorSubject<MenuItem[]>([]);
  private base_ = environment.apiBaseUrl.replace(/\/+$/, ''); // Remove trailing slashes

  private _items = signal<MenuItem[]>([]);
  private _loading = signal(false);

  items = computed(() => this._items());
  loading = computed(() => this._loading());


  constructor(private http: HttpClient, private tokens: TokenService) { }


  private normalize(node: MenuItemApi): MenuItem {
    return {
      id: String(node.id),
      label: node.label ?? '',
      icon: node.icon ?? undefined,
      path: node.path ?? undefined,
      children: (node.children ?? undefined)?.map(n => this.normalize(n)),
    };
  }

  loadFromApi(): Observable<MenuItem[]> {
    if (this._loading()) return of(this._items());
    this._loading.set(true);

    const jwt = this.tokens.getToken();
    const headers = jwt
    ? new HttpHeaders( { Authorization: `Bearer ${jwt}`})
    : new HttpHeaders();

    return this.http.get<MenuItem[]>(`${this.base_}/menuApp/`,{ headers })
      .pipe(
        map(arr => Array.isArray(arr) ? arr : []),
        map(arr => arr.map(n=> this.normalize(n))),
        tap(items => this._items.set(items)),
        tap(() => this._loading.set(false)),
        catchError(err => {
          console.error('Menu load error', err);
          this._loading.set(false);
          return of([] as MenuItem[]);
        }),
        finalize(() => this._loading.set(false))
      );


  }

  getMenuObservable(): Observable<MenuItem[]> {
    return of(this._items());
  }


  clear() { this._items.set([]); }
  /*
  //========Anterior Codigo
  get roles(): readonly string[] {
    return this.roles_;
  }
  /*
  private _roles = signal<string[]>([]);

  private base: MenuItem[] = [
  { label: 'Usuarios', icon: 'group', path: '/users', roles: ['admin'] },
  { label: 'Reportes', icon: 'analytics', path: '/reports', roles: ['admin', 'agent'] },

  ]
  *//*
  setRoles(roles: string[]) {
    //this._roles.set(roles);
   this.roles_ = roles;
   this.fetchMenu().subscribe(items=> this.menu$.next(items));
  }

  fetchMenu(): Observable<MenuItem[]>{
    console.log(this.base_)
    return this.http.post<MenuItem[]>(`${this.base_}/menu`,{roles: this.roles_})
  }

  getMenu(): MenuItem[]{
    return this.menu$.getValue();
  }

  getMenuObservable(): Observable<MenuItem[]>{
    return this.menu$.asObservable();
  }*/

  /*getMenu(): MenuItem[] {
    const roles = this._roles();

   const can = (item: MenuItem) =>
    !item.roles || item.roles.some(r => roles.includes(r));
   const filter = (items: MenuItem[]): MenuItem[] =>
    items
     .filter(can)
     .map(i => ({ ...i, children: i.children ? filter(i.children) : undefined }))
     .filter(i => !i.children || i.children.length > 0);
   return filter(this.base);
  }
  */

}
