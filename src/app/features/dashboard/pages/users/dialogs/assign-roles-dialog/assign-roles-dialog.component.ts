import { ChangeDetectionStrategy, Component, Inject, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { Users } from '../../../../../../core/services/users';
import { Roles } from '../../../../../../core/services/roles';
import { Role } from '../../../../../../core/models/role.model';
import { User } from '../../../../../../core/models/user.model';

@Component({
  selector: 'app-assign-roles-dialog',
  standalone: true,
  imports: [ MatButtonModule, MatListModule,MatDialogModule],
  templateUrl: './assign-roles-dialog.component.html',
  styleUrl: './assign-roles-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignRolesDialogComponent {
  private ref = inject(MatDialogRef<AssignRolesDialogComponent>)
  private users = inject(Users);
  private rolesSvc = inject(Roles);

  roles = signal<Role[]>([]);
  selected = signal<Set<string>>(new Set());
  loading = signal(true);

  constructor(@Inject(MAT_DIALOG_DATA) public user: User) { }

  ngOnInit() {
    this.rolesSvc.list().subscribe({
      next: (rs) => {
        // Ensure rs is Role[]
        const rolesArray: Role[] = (rs as unknown as Role[]);
        this.roles.set(rolesArray);
        this.selected.set(new Set(this.user.roles ?? []));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    })
  }


  toggle(roleId: string) {
    const to = new Set(this.selected());
    to.has(roleId) ? to.delete(roleId) : to.add(roleId);
    this.selected.set(to);
  }

  save(){
    this.users.assigRoles(this.user.pk_iduser, Array.from(this.selected())).subscribe({
      next: () => this.ref.close(true),
      error: () => this.ref.close(false)
    })
  }

  close() { this.ref.close();}





}
