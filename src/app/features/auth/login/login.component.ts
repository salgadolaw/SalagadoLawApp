
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';




import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink,MatFormFieldModule,MatInputModule, MatButtonModule, MatIconModule,MatProgressSpinnerModule,MatCardModule, MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

 value='Hola';


    loading = signal(false);
  error = signal<string | null>(null);
  hide = true;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

 clearEmail() {
    this.form.controls.email.setValue('');
  }

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    let { email, password } = this.form.value;
  const emailClean = (email ?? '').trim().toLowerCase();
  const passwordClean = (password ?? '').trim();

    this.auth.login(emailClean, passwordClean).subscribe({
      next: ({  accessToken }) => {
        this.auth.storeSession(accessToken);
        this.router.navigateByUrl('/');
      } ,
      error: (err) => {
     let msg = 'Error inesperado. Intenta nuevamente.';
        if (err?.status === 0) msg = 'Sin conexión con el servidor.';
        else if (err?.status === 401) msg = 'Usuario y/o contraseña incorrectos.';
        else if (typeof err?.error === 'string' && err.error.trim()) msg = err.error;
        else if (err?.error?.error) msg = String(err.error.error);

        this.error.set(msg);
        this.loading.set(false);
        //this.snack.open(msg, 'Cerrar', { duration: 4000 });
        //console.warn('Login debug →', { status: err?.status, err });
      }
  });
  }






}
