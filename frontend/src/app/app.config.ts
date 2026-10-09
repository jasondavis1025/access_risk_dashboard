import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './auth/auth.service';
import { MockAuthService } from './auth/mock-auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(routes),
    // index.html loads the Material Symbols font, not the legacy Material Icons font.
    provideAppInitializer(() => {
      inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
    }),
    // DEMO authentication. Replace MockAuthService with an HTTP-backed AuthService implementation.
    { provide: AuthService, useClass: MockAuthService },
  ],
};
