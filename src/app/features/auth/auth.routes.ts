import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPassword} from './forgot-password/forgot-password.component';
import { ResetPassword } from './reset-password/reset-password.component';

export const AUTH_ROUTES: Routes = [
  { path: 'login',  component: LoginComponent },
  { path: 'forgot', component: ForgotPassword },
  { path: 'reset',  component: ResetPassword },
];
