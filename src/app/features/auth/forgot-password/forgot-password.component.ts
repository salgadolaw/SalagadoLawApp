import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  sent = false;

  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  submit() {
    if (this.form.invalid) return;
    (this.auth.forgot(this.form.value.email!) as Observable<boolean>)
    .subscribe({
      next: () => this.sent = true,
      error: () => this.sent = false,
    });
  }


}
