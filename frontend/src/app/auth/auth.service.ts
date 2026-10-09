import { Signal } from '@angular/core';
import { AuthSession, Credentials } from './auth.models';

/**
 * The contract between the UI and whatever performs authentication. Components and guards inject
 * this class only, never an implementation, so the mock can be replaced by an HTTP-backed service
 * in `app.config.ts` without touching the UI.
 *
 * Methods resolve with the new session, or reject with an `AuthError`.
 */
export abstract class AuthService {
  /** The current session, or `null` when signed out. */
  abstract readonly session: Signal<AuthSession | null>;

  abstract signup(credentials: Credentials): Promise<AuthSession>;

  abstract login(credentials: Credentials): Promise<AuthSession>;

  abstract logout(): void;
}
