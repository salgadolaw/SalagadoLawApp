import { computed, inject, Injectable, NgZone, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { auditTime, BehaviorSubject, filter, fromEvent, interval, merge, skip, Subscription, switchMap, takeUntil, tap, timer, withLatestFrom } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { SessionWarningDialogComponent } from '../../shared/components/session-warning-dialog/session-warning-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class IdleService {
  private zone = inject(NgZone);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private auth = inject(AuthService);
  private tokens = inject(TokenService);


  private lastActivity$ = new BehaviorSubject<number>(Date.now());
  private subs = new Subscription();
  private dialogRef: any | null = null;

  private readonly timeoutMs = signal<number>(environment.auth?.idle?.timeoutMs ?? 10 * 60_000);
  private readonly warningMs = signal<number>(
    Math.min(
      environment.auth?.idle?.warningDurationMs ?? 60_000,
      this.timeoutMs()
    ));


  remainingMs = signal<number>(this.timeoutMs());
  remainingSeconds = computed(() => Math.max(0, Math.ceil(this.remainingMs() / 1000)));

  /** Restante hasta mostrar aviso (ms) = timeout - warning */
  private preWarnMs = computed(() => Math.max(this.timeoutMs() - this.warningMs(), 0));



  start() {

    // Observa eventos de usuario y sincroniza entre pestañas
    this.zone.runOutsideAngular(() => {
      const activityEvents$ = merge(
        fromEvent(document, 'mousemove'),
        fromEvent(document, 'mousedown'),
        fromEvent(document, 'keydown'),
        fromEvent(document, 'scroll'),
        fromEvent(document, 'touchstart'),
        fromEvent(window, 'focus'),
        fromEvent(document, 'visibilitychange')
      ).pipe(auditTime(1000));

      this.subs.add(
        activityEvents$.subscribe(() => this.onActivity())
      );

      // Sincroniza actividad entre pestañas (localStorage)
      this.subs.add(
        fromEvent<StorageEvent>(window, 'storage')
          .pipe(filter(e => e.key === 'lastActivityAt'))
          .subscribe(() => this.lastActivity$.next(Date.now()))
      );
    });

    // Programa el aviso y la expulsión cuando haya token válido
    this.subs.add(
      interval(1000)
        .pipe(withLatestFrom(this.lastActivity$))
        .subscribe(([_, last]) => {
          const left = this.timeoutMs() - (Date.now() - last);
          this.zone.run(() => this.remainingMs.set(Math.max(0, left)));
        })
    );
    this.subs.add(
      this.lastActivity$.pipe(
        filter(() => this.tokens.isAuthenticated()),   // sólo si hay sesión
        switchMap(() => {
          // cerrar diálogo si estaba abierto
          if (this.dialogRef) this.zone.run(() => this.dialogRef.close('stay'));

          const nextActivity$ = this.lastActivity$.pipe(skip(1));
          const preWarn = this.preWarnMs();   // constante por ciclo
          const warnDur = this.warningMs();   // duración del aviso

          // Espera hasta el aviso (pero cancela ante nueva actividad)
          return timer(preWarn).pipe(
            takeUntil(nextActivity$),
            tap(() => this.openWarningDialog()),
            // Tras abrir el aviso, cuenta hasta el logout (pero cancela con actividad)
            switchMap(() => timer(warnDur).pipe(takeUntil(nextActivity$)))
          );
        })
      ).subscribe(() => this.logout('idle-timeout'))
    );


  }

  /** Llamar al destruir la app (opcional). */
  stop() {
    this.subs.unsubscribe();
    this.subs = new Subscription();
    this.dialogRef?.close();
    this.dialogRef = null;
    this.remainingMs.set(0);
  }

  setTimeoutMs(ms: number, warningMs?: number) {
    this.timeoutMs.set(ms);
    if (warningMs !== undefined) this.warningMs.set(Math.min(warningMs, ms));
    // Reinicia el ciclo con nueva configuración
    this.onActivity();
  }

  /** Forzar reinicio del temporizador (p.ej., tras login o click en "Seguir conectado"). */
  reset() { this.onActivity(); }

  /** Marca actividad y propaga a otras pestañas. */
  private onActivity() {
    const now = Date.now();
    this.lastActivity$.next(now);
    try { localStorage.setItem('lastActivityAt', String(now)); } catch { /* ignore */ }
  }

  private openWarningDialog() {
    // si ya no hay token (logout en otra pestaña), no avisar
    if (!this.tokens.isAuthenticated()) return;

    this.zone.run(() => {
      this.dialogRef?.close();
      this.dialogRef = this.dialog.open(SessionWarningDialogComponent, {
        disableClose: true,
        width: '420px'
      });

      const seconds = Math.ceil(this.warningMs() / 1000);
      this.dialogRef.componentInstance.start(seconds);

      this.dialogRef.afterClosed().subscribe((result: 'stay' | 'logout' | 'timeout' | undefined) => {
        this.dialogRef = null;
        if (result === 'stay') {
          // Usuario quiere seguir: reprograma (actividad)
          this.onActivity();
        } else if (result === 'logout' || result === 'timeout') {
          this.logout(result === 'timeout' ? 'idle-timeout' : 'user-choice');
        }
      });
    });
  }

  private logout(reason: 'idle-timeout' | 'user-choice') {
    // Elimina token y manda al login
    this.zone.run(() => {
 try{ this.dialog.closeAll(); }catch{}

      this.auth.logOut();
      this.router.navigate(['/auth/login'], { replaceUrl: true, state: { reason } });
    });
  }



}
