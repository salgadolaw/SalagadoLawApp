import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal, ViewChild, viewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';


import { Users } from '../../../../core/services/users';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../../core/models/user.model';
import { UserFormDialogComponent } from './dialogs/user-form-dialog/user-form-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AssignRolesDialogComponent } from './dialogs/assign-roles-dialog/assign-roles-dialog.component';
import { map } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule,
    MatDialogModule, MatSnackBarModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  private usersSvc = inject(Users);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  displayedColumns: string[] = ['name', 'email', 'active', 'actions'];

  data = signal<User[]>([]);
  total = signal(0);
  loading = signal(false);

  pageIndex = signal(0);
  pageSize = signal(10);
  sortActive = signal<'v_firstname' | 'email' | 'createAt'>('v_firstname');
  sortDirection = signal<'asc' | 'desc'>('asc');
  search = signal('');


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    //efect: cada que cambie a paginación/orden y/o busqueda recarga

    effect(() => {
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.usersSvc.list({
      page: this.pageIndex() + 1,
      pageSize: this.pageSize(),
      sort: this.sortActive(),
      order: this.sortDirection(),
      search: this.search() || undefined
    }).subscribe({
      next: (res) => {

        const data = (res.data ?? []).map((u: any) => ({
          ...u,
          v_firstname: u.v_firstname ?? '—',
          pk_states: u.pk_states ?? '—'
        }));

        this.data.set(data);

        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Error cargando usuarios', 'Cerrar', { duration: 3000 });
      }
    });

  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
  }

  onSort(e: Sort) {
    if (!e.active || !e.direction) return;
    this.sortActive.set(e.active as 'v_firstname' | 'email' | 'createAt');
    this.sortDirection.set(e.direction as 'asc' | 'desc');
  }

  onSearch(value: string) {
    this.pageIndex.set(0);
    this.search.set(value.trim());
  }

  openCreate() {
    const ref = this.dialog.open(UserFormDialogComponent, { width: '480px', data: null });
    ref.afterClosed().subscribe(ok => ok && this.load());
  }

  openEdit(user: User) {
    const ref = this.dialog.open(UserFormDialogComponent, { width: '480px', data: user });
    ref.afterClosed().subscribe(ok => ok && this.load());
  }

  inactivate(user: User) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { title: 'Inactivar usuario', message: `¿Está seguro de inactivar el usuario ${user.v_firstname}?` }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      try {

        this.usersSvc.inactivate(user.pk_iduser).subscribe({
          next: () => {
            this.snack.open('Usuario inactivado', 'Cerrar', { duration: 2500 });
            this.load();
          },
          error: () => {
            this.snack.open('Error inactivando usuario', 'Cerrar', { duration: 3000 });
          }
        })

        /*const result = this.usersSvc.inactivate(user.pk_iduser);
        console.log(result);
        if (result ){//&& result.activate === false) {
          this.snack.open('Usuario inactivado', 'Cerrar', { duration: 2500 });
          this.load();
        } else {
          this.snack.open('Error inactivando usuario', 'Cerrar', { duration: 3000 });
        }*/
      } catch {
        this.snack.open('Error inactivando usuario', 'Cerrar', { duration: 3000 });
      }

    });


  }


  assignRoles(user: User) {
    const ref = this.dialog.open(AssignRolesDialogComponent, { width: '520px', data: user });
    ref.afterClosed().subscribe(ok => ok && this.load());

  }


}
