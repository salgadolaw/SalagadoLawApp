import { CommonModule } from '@angular/common';

import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { routes } from '../../../app.routes';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword {
private fb = inject(FormBuilder);
private auth = inject(AuthService);
private route = inject(ActivatedRoute);
done = false;


  token = this.route.snapshot.queryParamMap.get('token') ?? '';

 form = this.fb.group({
    password: ['', [Validators.required]],
    confirm:  ['', [Validators.required]],
  });


  submit() {
    if (this.form.invalid) return;
    const { password, confirm } = this.form.value;
    if (password !== confirm) return;
    (this.auth.reset(this.token, password!) as Observable<boolean>)
    .subscribe({
      next: () => this.done = true,
      error: () => this.done = false,
    });
  }

}
