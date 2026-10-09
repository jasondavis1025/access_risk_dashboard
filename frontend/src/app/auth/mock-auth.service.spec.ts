import { AuthError } from './auth.models';
import { MOCK_AUTH_DELAY_MS, MOCK_AUTH_EMAILS, MockAuthService } from './mock-auth.service';

describe('MockAuthService', () => {
  let service: MockAuthService;
  const masterPassword = 'correct horse battery';

  beforeEach(() => {
    vi.useFakeTimers();
    service = new MockAuthService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function settle<T>(promise: Promise<T>): Promise<T> {
    await vi.advanceTimersByTimeAsync(MOCK_AUTH_DELAY_MS);
    return promise;
  }

  it('resolves login only after the simulated delay', async () => {
    let resolved = false;
    const result = service.login({ email: 'a@example.com', masterPassword }).then((s) => {
      resolved = true;
      return s;
    });

    await vi.advanceTimersByTimeAsync(MOCK_AUTH_DELAY_MS - 1);
    expect(resolved).toBe(false);
    expect(service.session()).toBeNull();

    await vi.advanceTimersByTimeAsync(1);
    expect(await result).toEqual({ email: 'a@example.com' });
    expect(service.session()).toEqual({ email: 'a@example.com' });
  });

  it('normalizes the email and keeps no password in the session', async () => {
    const session = await settle(service.signup({ email: '  New@Example.COM ', masterPassword }));
    expect(session).toEqual({ email: 'new@example.com' });
    expect(JSON.stringify(service.session())).not.toContain(masterPassword);
  });

  it('rejects login for the rejected-login email and stays signed out', async () => {
    const result = service.login({ email: 'WRONG@example.com', masterPassword });
    const assertion = expect(result).rejects.toMatchObject({ code: 'invalid-credentials' });
    await vi.advanceTimersByTimeAsync(MOCK_AUTH_DELAY_MS);
    await assertion;
    expect(service.session()).toBeNull();
  });

  it('rejects signup for the taken email', async () => {
    const result = service.signup({ email: MOCK_AUTH_EMAILS.signupTaken, masterPassword });
    const assertion = expect(result).rejects.toMatchObject({ code: 'email-taken' });
    await vi.advanceTimersByTimeAsync(MOCK_AUTH_DELAY_MS);
    await assertion;
  });

  it('simulates an unavailable service for both calls', async () => {
    for (const call of [service.login, service.signup]) {
      const result = call.call(service, { email: MOCK_AUTH_EMAILS.unavailable, masterPassword });
      const assertion = expect(result).rejects.toBeInstanceOf(AuthError);
      await vi.advanceTimersByTimeAsync(MOCK_AUTH_DELAY_MS);
      await assertion;
    }
    expect(service.session()).toBeNull();
  });

  it('clears the session on logout', async () => {
    await settle(service.login({ email: 'a@example.com', masterPassword }));
    service.logout();
    expect(service.session()).toBeNull();
  });
});
