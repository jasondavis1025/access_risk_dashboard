import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// These guards only control which page the browser shows. They are not a security boundary:
// anyone can bypass client-side code. Real authorization must be enforced by the backend API.

/** Sends signed-out users to /login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.session() ? true : router.createUrlTree(['/login']);
};

/** Sends signed-in users away from /login and /signup to /vault. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.session() ? router.createUrlTree(['/vault']) : true;
};
