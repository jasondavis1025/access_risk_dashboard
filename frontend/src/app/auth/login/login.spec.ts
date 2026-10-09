import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthError } from '../auth.models';
import { AuthService } from '../auth.service';
import { deferred, StubAuthService } from '../testing/stub-auth.service';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let auth: StubAuthService;
  let el: HTMLElement;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    auth = new StubAuthService();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Login);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  const input = (name: string) =>
    el.querySelector<HTMLInputElement>(`[formcontrolname="${name}"]`)!;
  const submitButton = () => el.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const errors = () => [...el.querySelectorAll('mat-error')].map((e) => e.textContent!.trim());

  function type(name: string, value: string): void {
    const field = input(name);
    field.value = value;
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new Event('blur'));
  }

  // The stub's promise is invisible to Angular, so let the component's continuation run first.
  async function settled(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  }

  async function submit(): Promise<void> {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  it('uses login autocomplete hints', () => {
    expect(input('email').getAttribute('autocomplete')).toBe('username');
    expect(input('masterPassword').getAttribute('autocomplete')).toBe('current-password');
  });

  it('shows validation messages and does not call the service when empty', async () => {
    await submit();
    expect(errors()).toEqual(['Enter your email address.', 'Enter your master password.']);
    expect(auth.calls).toHaveLength(0);
    expect(document.activeElement).toBe(input('email'));
  });

  it('rejects a malformed email', async () => {
    type('email', 'not-an-email');
    await fixture.whenStable();
    expect(errors()).toContain('Enter a valid email address, like name@example.com.');
  });

  it('toggles password visibility', async () => {
    const toggle = el.querySelector<HTMLButtonElement>(
      'button[aria-label="Show master password"]',
    )!;
    expect(input('masterPassword').type).toBe('password');
    toggle.click();
    await fixture.whenStable();
    expect(input('masterPassword').type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('shows loading, blocks duplicate submits, then navigates on success', async () => {
    type('email', 'a@example.com');
    type('masterPassword', 'any password');
    await submit();
    await submit();

    expect(auth.calls).toEqual([
      { method: 'login', credentials: { email: 'a@example.com', masterPassword: 'any password' } },
    ]);
    expect(submitButton().textContent).toContain('Logging in…');
    expect(submitButton().getAttribute('aria-disabled')).toBe('true');
    expect(el.querySelector('form')!.getAttribute('aria-busy')).toBe('true');

    auth.pending.resolve({ email: 'a@example.com' });
    await settled();

    expect(navigate).toHaveBeenCalledWith('/vault');
    expect(submitButton().textContent).toContain('Log in');
  });

  it('shows the rejection message and allows retry', async () => {
    type('email', 'wrong@example.com');
    type('masterPassword', 'any password');
    await submit();

    auth.pending.reject(
      new AuthError('invalid-credentials', 'Email or master password is incorrect.'),
    );
    await settled();

    expect(el.querySelector('[role="alert"]')!.textContent).toContain(
      'Email or master password is incorrect.',
    );
    expect(navigate).not.toHaveBeenCalled();
    expect(submitButton().getAttribute('aria-disabled')).not.toBe('true');

    auth.pending = deferred();
    await submit();
    expect(auth.calls).toHaveLength(2);
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });
});
