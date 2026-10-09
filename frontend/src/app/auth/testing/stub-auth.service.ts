import { signal } from '@angular/core';
import { AuthSession, Credentials } from '../auth.models';
import { AuthService } from '../auth.service';

/** Test double: records calls and returns `pending`, which the test resolves or rejects. */
export class StubAuthService extends AuthService {
  readonly sessionState = signal<AuthSession | null>(null);
  readonly session = this.sessionState.asReadonly();

  readonly calls: { method: 'signup' | 'login'; credentials: Credentials }[] = [];
  pending = deferred<AuthSession>();

  signup(credentials: Credentials): Promise<AuthSession> {
    this.calls.push({ method: 'signup', credentials });
    return this.pending.promise;
  }

  login(credentials: Credentials): Promise<AuthSession> {
    this.calls.push({ method: 'login', credentials });
    return this.pending.promise;
  }

  logout(): void {
    this.sessionState.set(null);
  }
}

export interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

export function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
