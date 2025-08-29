// src/app/shared/components/session-warning-dialog/session-warning-dialog.component.ts
import { Component, inject, signal, OnDestroy } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-session-warning-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>¿Sigues ahí?</h2>
    <mat-dialog-content>
      <p>Por inactividad cerraremos tu sesión en <b>{{ seconds() }}</b> segundos.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="stay()">Seguir conectado</button>
      <button mat-raised-button color="warn" (click)="logoutNow()">Salir ahora</button>
    </mat-dialog-actions>
  `
})
export class SessionWarningDialogComponent implements OnDestroy {
  private ref = inject(MatDialogRef<SessionWarningDialogComponent>);
  private sub?: Subscription;
  seconds = signal(60); // el IdleService fijará el valor real al abrir

  start(secondsTotal: number) {
    this.seconds.set(secondsTotal);
    this.sub?.unsubscribe();
    this.sub = interval(1000).subscribe(() => {
      const next = this.seconds() - 1;
      this.seconds.set(Math.max(next, 0));
      if (next <= 0) this.ref.close('timeout');
    });
  }

  stay() { this.ref.close('stay'); }
  logoutNow() { this.ref.close('logout'); }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}
