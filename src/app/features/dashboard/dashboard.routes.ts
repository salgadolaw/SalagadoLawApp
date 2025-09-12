import { Routes } from '@angular/router';

// OJO: sin ".component"
import { DashboardLayoutComponent }from './layout/dashboard-layout/dashboard-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { DailymessageComponent } from './pages/dailymessage/dailymessage.component';
import { roleGuard } from '../../core/guards/role-guard';


export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout.component')
        .then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        canMatch: [roleGuard],
        loadComponent: () =>
          import('./pages/home/home.component')
            .then(m => m.HomeComponent),

      },
      {
        path:'dailymessage',
        canMatch: [roleGuard],
        loadComponent: () =>
          import('./pages/dailymessage/dailymessage.component')
            .then(m => m.DailymessageComponent),
      },
      {
        path:'users',
        canMatch: [roleGuard],
        //data: { roles: ['admin'] },
        loadComponent: () =>
          import('./pages/users/users.component')
            .then(m => m.UsersComponent),
      },

    ],
  },
  { path: '**', redirectTo: '' },
];
