import { Injectable, signal } from '@angular/core';
import { AuthError, AuthSession, Credentials } from './auth.models';
import { AuthService } from './auth.service';

/** Emails that trigger the mock's failure scenarios (case-insensitive). */
export const MOCK_AUTH_EMAILS = {
  loginRejected: 'wrong@example.com',
  signupTaken: 'taken@example.com',
  unavailable: 'offline@example.com',
} as const;

/** Simulated network latency for every call. */
export const MOCK_AUTH_DELAY_MS = 800;

/**
 * DEMO ONLY: provides no security. Responses are decided by the email address alone (see
 * `MOCK_AUTH_EMAILS`); every other valid email succeeds. No accounts exist, nothing is persisted,
 * and nothing is sent over the network. The master password is never read, so it can't be logged
 * or stored. The session lives in memory and ends on logout or page reload.
 */
@Injectable()
export class MockAuthService extends AuthService {
  private readonly currentSession = signal<AuthSession | null>(null);
  readonly session = this.currentSession.asReadonly();

  async signup({ email }: Credentials): Promise<AuthSession> {
    const normalized = await this.simulateRequest(email);
    if (normalized === MOCK_AUTH_EMAILS.signupTaken) {
      throw new AuthError(
        'email-taken',
        'An account with this email already exists. Log in instead.',
      );
    }
    return this.startSession(normalized);
  }

  async login({ email }: Credentials): Promise<AuthSession> {
    const normalized = await this.simulateRequest(email);
    if (normalized === MOCK_AUTH_EMAILS.loginRejected) {
      throw new AuthError('invalid-credentials', 'Email or master password is incorrect.');
    }
    return this.startSession(normalized);
  }

  logout(): void {
    this.currentSession.set(null);
  }

  private async simulateRequest(email: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_AUTH_DELAY_MS));
    const normalized = email.trim().toLowerCase();
    if (normalized === MOCK_AUTH_EMAILS.unavailable) {
      throw new AuthError('unavailable', 'The service is unavailable right now. Try again later.');
    }
    return normalized;
  }

  private startSession(email: string): AuthSession {
    const session: AuthSession = { email };
    this.currentSession.set(session);
    return session;
  }
}
