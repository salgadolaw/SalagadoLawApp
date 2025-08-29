import { Routes } from '@angular/router';

// OJO: sin ".component"
import { DashboardLayoutComponent }from './layout/dashboard-layout/dashboard-layout.component';
import { HomeComponent } from './pages/home/home.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout.component')
        .then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.component')
            .then(m => m.HomeComponent),
      },
    ],
  },
];
