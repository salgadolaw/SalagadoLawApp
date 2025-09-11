
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';


import { MatSidenav, MatSidenavContainer, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';



import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmLogoutComponent } from '../../../../shared/components/confirm-logout/confirm-logout.component';
import { TokenService } from '../../../../core/services/token.service';
import { Menu } from '../../../../core/services/menu';
import { Roles } from '../../../../core/services/roles';

type MenuItem = { label: string; icon?: string; path?: string; roles?: string[]; children?: MenuItem[] };



@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule
    , MatExpansionModule
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss'
})
export class DashboardLayoutComponent {
  sidebarOpen = signal(true);
  private auth = inject(AuthService);
  private router = inject(Router);
  private tokens = inject(TokenService);
  private dialog = inject(MatDialog);
  private menu = inject(Menu);

  @ViewChild(MatSidenavContainer) container!: MatSidenavContainer;
  @ViewChild(MatSidenav) sidenav!: MatSidenav;

  private ro?: ResizeObserver;

  menuItems = signal<MenuItem[]>([]);

  /*nav: NavItem[] = [
      { label: 'Home', icon: 'home', link: '/dashboard/home' },
      { label: 'Daily', icon: 'person', link: '/dailymessage' },
      { label: 'Settings', icon: 'settings', link: '/dashboard/settings' },
      { label: 'Users', icon: 'settings', link: '/users' },
    ];
  */

  ngOnInit() {

    /*const claims = this.tokens.getClaims();
    const roles = Array.isArray(claims?.roles) ? claims!.roles : [];

    this.menu.setRoles(roles);
    this.menu.getMenuObservable().subscribe(items => this.menuItems.set(items));*/
    this.menu.loadFromApi().subscribe(items => {
      this.menuItems.set(items);
      queueMicrotask(() => this.container?.updateContentMargins());
      setTimeout(() => this.container?.updateContentMargins(), 0);
    });//items => this.menuItems.set(items));
    /* const roles = this.resolveRoles();
   if(roles.length){
     this.menu.setRoles(roles);
     this.menu.getMenuObservable().subscribe(items => {
      this.menuItems = items;
     })
   }*/
  }

  ngAfterViewInit(): void {
    // Observa cambios de tamaño del sidenav (por contenido dinámico)
    this.ro = new ResizeObserver(() => {
      this.container?.updateContentMargins();
    });
    // @ts-ignore acceso nativo
    this.ro.observe(this.sidenav._elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
  }

  onPanelToggled() {
    // Reajusta cuando se expanden/colapsan paneles
    this.container?.updateContentMargins();
  }


  //menuItems = computed<MenuItem[]>(()=> this.menu.getMenu() as MenuItem[]);
  //Helpers
  trackByPath = (_: number, item: MenuItem) => item.path ?? item.label;

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


  goTo(item: MenuItem) {
    if (item.path) this.router.navigateByUrl(item.path);
  }

  private resolveRoles(): string[] {
    try {

      const fromToken = (this.tokens as any).getRoles?.();
      if (Array.isArray(fromToken) && fromToken.length) return fromToken;

      const fromAuthFn = (this.auth as any).getRoles?.();
      if (Array.isArray(fromAuthFn) && fromAuthFn.length) return fromAuthFn;
      const currentUser = (this.auth as any).currentUser?.();
      if (currentUser?.roles && Array.isArray(currentUser.roles)) return currentUser.roles;
      console.log(fromToken, fromAuthFn, currentUser)

    } catch (error) {

    }
    return [];
  }





}
