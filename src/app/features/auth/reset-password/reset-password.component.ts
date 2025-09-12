import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, ResetResult } from '../../../core/services/auth.service';
import { routes } from '../../../app.routes';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);


  code = this.route.snapshot.queryParamMap.get('code') ?? '';
  loading = false;
  done = false;
  error: string | null = null;




  form = this.fb.group({
    password: ['', [Validators.required]],
    confirm: ['', [Validators.required]],
  }, {
    validators: (group) => {
      const p = group.get('password')?.value;
      const c = group.get('confirm')?.value;
      return p && c && p === c ? null : {
        mismatch: true
      };
    }
  }

  );


  submit() {
    if (this.loading || this.form.invalid || !this.code) return;
    this.loading = true;
    this.error = null;
    const { password, confirm } = this.form.value;

    (this.auth.reset(this.code, password!))
      .subscribe((res: ResetResult) =>{
      this.loading = false;
      console.log(res.ok, this.code);
      if(res.ok){
        this.done = true;
        setTimeout(() => {
          this.router.navigateByUrl('/auth/login');
        }, 2000);
      }else{
        this.error = res.reason === 'expired' ? 'El enlace ha expirado o ya fue usado' : 'El enlace no es válido';
      }
      });
  }

}
