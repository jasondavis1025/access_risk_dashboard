/**
 * Credentials collected by the signup and login forms. The master password exists only in memory
 * for the duration of the call. Implementations must never log it, store it, or send it as-is.
 */
export interface Credentials {
  email: string;
  masterPassword: string;
}

/** Who is signed in. Holds no secrets. */
export interface AuthSession {
  email: string;
}

export type AuthErrorCode = 'invalid-credentials' | 'email-taken' | 'unavailable';

/** A failure the UI can show to the user. `message` is user-facing and must not contain secrets. */
export class AuthError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/** Maps any thrown value to a message that is safe to display. */
export function authErrorMessage(error: unknown): string {
  return error instanceof AuthError ? error.message : 'Something went wrong. Try again.';
}
