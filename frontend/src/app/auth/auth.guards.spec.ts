import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { authGuard, guestGuard } from './auth.guards';
import { AuthService } from './auth.service';
import { StubAuthService } from './testing/stub-auth.service';

describe('auth guards', () => {
  let auth: StubAuthService;

  beforeEach(() => {
    auth = new StubAuthService();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });

  function run(guard: CanActivateFn): unknown {
    return TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  const url = (result: unknown) => TestBed.inject(Router).serializeUrl(result as UrlTree);

  it('authGuard redirects signed-out users to /login', () => {
    expect(url(run(authGuard))).toBe('/login');
  });

  it('authGuard allows signed-in users', () => {
    auth.sessionState.set({ email: 'a@example.com' });
    expect(run(authGuard)).toBe(true);
  });

  it('guestGuard redirects signed-in users to /vault', () => {
    auth.sessionState.set({ email: 'a@example.com' });
    expect(url(run(guestGuard))).toBe('/vault');
  });

  it('guestGuard allows signed-out users', () => {
    expect(run(guestGuard)).toBe(true);
  });
});
