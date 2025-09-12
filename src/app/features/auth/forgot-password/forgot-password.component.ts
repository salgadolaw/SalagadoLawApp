import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  constructor( private cdr: ChangeDetectorRef) {}
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  loading = false;
  sent = false;
  error: string | null = null;


  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  submit() {
    if (this.loading || this.form.invalid) return;
    this.loading = true;
    const email = this.form.value.email || '' || 'undefined';

    (this.auth.forgot(email).subscribe({
      next: ({ ok }) => {
        if (ok) {
          this.sent = true;
          this.error = null;

          this.cdr.markForCheck();
          setTimeout(() => {
            this.router.navigateByUrl('/auth/login');
          }, 3000);
        } else {
          this.error = 'No pudimos enviar el enlace. Intenta de nuevo en unos segundos.';
          this.cdr.markForCheck();
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Error de conexión. Revisa tu red e inténtalo nuevamente.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    })
    )
  }


}
