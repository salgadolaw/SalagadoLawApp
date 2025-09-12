import { ChangeDetectionStrategy, Component, DestroyRef, effect, Inject, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCard } from "@angular/material/card";
import { MatDivider } from "@angular/material/divider";
import { MatSelectChange, MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from '@angular/material/core';

import { Users } from '../../../../../../core/services/users';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../../../../core/models/user.model';
import { OptionDto } from '../../../../../../core/models/option-dto';
import { CommonModule } from '@angular/common';
import { disableDebugTools } from '@angular/platform-browser';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatOptionModule, MatDivider],
  templateUrl: './user-form-dialog.component.html',
  styleUrl: './user-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormDialogComponent {
  private fb = inject(FormBuilder);
  private users = inject(Users);
  private ref = inject(MatDialogRef<UserFormDialogComponent>);
  private destroyRef = inject(DestroyRef);

  constructor(@Inject(MAT_DIALOG_DATA) public data: User | null) { }



  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [ Validators.email]],
    apellido: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    option: this.fb.control<OptionDto | null>(null, [Validators.required]),
    clave: ['', [Validators.required, Validators.minLength(6)]]
  });


  loading = signal(false);
  options = signal<OptionDto[]>([]);
  loadingOptions = signal(false);
  error = signal<string | null>(null);


  ngOnInit() {

    if (this.data) {
      this.form.patchValue({
        name: this.data.v_firstname,
        apellido: this.data.v_lastname,
        usuario: this.data.username,
        email: this.data.email,
        option: this.data.pk_states ? { pk_idstates: 1, v_namestate: String(this.data.pk_states) } : null

      });
   const emailCtrl = this.form.get('email')!;
  emailCtrl.disable({ emitEvent: false });   // no participa en validación
  emailCtrl.clearValidators();
  emailCtrl.updateValueAndValidity({ emitEvent: false });

   const clave = this.form.get('clave')!;
    clave.clearValidators();
    clave.updateValueAndValidity({ emitEvent: false });

    }
   this.loadingOptions.set(true);
    this.getOptionsStates();
  }


  getOptionsStates() {
    this.users.getOptionsStates().subscribe({
      next: (res: any[]) => {
        const arr = (Array.isArray(res) ? res : []).map(x => x.json || x);

        this.options.set(arr.map((r: any) => ({
          pk_idstates: r.pk_states ?? r.id,
          v_namestate: r.v_namestate ?? r.name ?? String(r)
        })));

        const id = this.data?.pk_states ?? this.data?.pk_states ?? null;
        if (id != null) {
          const match =
            this.options().find(o => o.pk_idstates === id) ??
            this.options().find(o => String(o.pk_idstates) === String(id));
          this.form.get('option')?.setValue(match ?? null, { emitEvent: false });
        }


        this.loadingOptions.set(false);
        // normaliza -> OptionDto { id, name }
        /*const norm = arr.map((r: any) => ({
           pk_idstates: r.pk_states ?? r.id,
           v_namestate: r.v_namestate ?? r.name ?? String(r)
         }));
         this.options.set(norm);
 */


      },

      error: (e) => {
        this.error.set('Error loading options');
        this.loadingOptions.set(false);
      }

    });
  }

  save() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    const request$ = this.data
      ? this.users.update(this.data.pk_iduser, {
        ...this.form.value,
        v_firstname: this.form.value.name ?? undefined,
        email: this.form.value.email ?? undefined,
        v_lastname: this.data.v_lastname
      })
      : this.users.create({
        ...this.form.value,
        v_firstname: this.form.value.name ?? '',
        //v_lastname: this.form.value.
        email: this.form.value.email ?? '',
        pk_states: this.form.value.option?.pk_idstates ?? 0,
        roles: []
      });

    request$.subscribe({
      next: () => { this.loading.set(false); this.ref.close(true); },
      error: () => { this.loading.set(false); }
    })

  }


  comapreById = (a: OptionDto | null, b: OptionDto | null) => a?.pk_idstates === b?.pk_idstates;

  onSelectionChange(val: MatSelectChange) {
    const value = val.value as OptionDto;
    console.log(value)
  }


  close() {
    this.ref.close();
  }


}
