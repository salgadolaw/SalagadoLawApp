import { ApplicationConfig, APP_INITIALIZER, importProvidersFrom, inject, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient,withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { authErrorInterceptor } from './core/interceptors/auth-error.interceptor';
import { TokenService } from './core/services/token.service';

function restoreToken(){
  return () => inject(TokenService).restore();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes)
    ,provideHttpClient(withInterceptors([authTokenInterceptor, authErrorInterceptor])),
    importProvidersFrom(BrowserAnimationsModule),
    { provide: APP_INITIALIZER, useFactory: restoreToken, multi: true, deps: [TokenService] }
  ]
};
