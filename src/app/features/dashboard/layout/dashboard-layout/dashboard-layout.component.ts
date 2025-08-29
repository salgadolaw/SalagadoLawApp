import { Token } from './../../../../../../node_modules/lightningcss/node/ast.d';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';


import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule }    from '@angular/material/list';
import { MatIconModule }    from '@angular/material/icon';
import { MatButtonModule }  from '@angular/material/button';
import { ɵInternalFormsSharedModule } from "@angular/forms";
import { ConfirmLogoutComponent } from '../../../../shared/components/confirm-logout/confirm-logout.component';
import { MatDialog } from '@angular/material/dialog';
import { TokenService } from '../../../../core/services/token.service';

type NavItem = { label: string; icon: string; link: string };



@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule, ɵInternalFormsSharedModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss'
})
export class DashboardLayoutComponent {
  sidebarOpen = signal(true);
  private auth = inject(AuthService);
  private router = inject(Router);
  private tokens = inject(TokenService);
 private dialog = inject(MatDialog);

nav: NavItem[] = [
    { label: 'Home', icon: 'home', link: '/dashboard/home' },
    { label: 'Profile', icon: 'person', link: '/dashboard/profile' },
    { label: 'Settings', icon: 'settings', link: '/dashboard/settings' },
  ];

  toggleSidebar() {
    this.sidebarOpen.update((value) => !value);
  }

  logOut() {

 this.dialog.open(ConfirmLogoutComponent).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.auth.logOut();
      this.tokens.clear();
      this.router.navigate(['/auth/login'], { replaceUrl: true });
      //this.snack.open('Sesión cerrada', 'OK', { duration: 2500 });
    });

  }




}
