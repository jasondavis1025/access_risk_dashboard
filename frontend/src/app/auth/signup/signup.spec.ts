import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthError } from '../auth.models';
import { AuthService } from '../auth.service';
import { StubAuthService } from '../testing/stub-auth.service';
import { Signup } from './signup';

describe('Signup', () => {
  let fixture: ComponentFixture<Signup>;
  let auth: StubAuthService;
  let el: HTMLElement;
  let navigate: ReturnType<typeof vi.spyOn>;
  const password = 'twelve chars plus';

  beforeEach(async () => {
    auth = new StubAuthService();
    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Signup);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  const input = (name: string) =>
    el.querySelector<HTMLInputElement>(`[formcontrolname="${name}"]`)!;
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

  it('uses new-password autocomplete hints', () => {
    expect(input('email').getAttribute('autocomplete')).toBe('email');
    expect(input('masterPassword').getAttribute('autocomplete')).toBe('new-password');
    expect(input('confirmMasterPassword').getAttribute('autocomplete')).toBe('new-password');
  });

  it('labels every field', () => {
    const labels = [...el.querySelectorAll('mat-label')].map((l) => l.textContent!.trim());
    expect(labels).toEqual(['Email', 'Master password', 'Confirm master password']);
  });

  it('shows required messages on empty submit', async () => {
    await submit();
    expect(errors()).toEqual([
      'Enter your email address.',
      'Enter a master password.',
      'Re-enter your master password.',
    ]);
    expect(auth.calls).toHaveLength(0);
  });

  it('enforces the minimum length', async () => {
    type('masterPassword', 'short');
    await fixture.whenStable();
    expect(errors()).toContain('Use at least 12 characters.');
  });

  it('flags mismatched passwords on the confirm field', async () => {
    type('email', 'a@example.com');
    type('masterPassword', password);
    type('confirmMasterPassword', password + 'x');
    await submit();

    expect(errors()).toEqual(["Master passwords don't match."]);
    expect(input('confirmMasterPassword').getAttribute('aria-invalid')).toBe('true');
    expect(auth.calls).toHaveLength(0);
  });

  it('submits once, then navigates to the vault on success', async () => {
    type('email', 'a@example.com');
    type('masterPassword', password);
    type('confirmMasterPassword', password);
    await submit();
    await submit();

    expect(auth.calls).toEqual([
      { method: 'signup', credentials: { email: 'a@example.com', masterPassword: password } },
    ]);
    expect(el.querySelector('button[type="submit"]')!.textContent).toContain('Creating account…');

    auth.pending.resolve({ email: 'a@example.com' });
    await settled();
    expect(navigate).toHaveBeenCalledWith('/vault');
  });

  it('shows the error when the email is taken', async () => {
    type('email', 'taken@example.com');
    type('masterPassword', password);
    type('confirmMasterPassword', password);
    await submit();

    auth.pending.reject(new AuthError('email-taken', 'An account with this email already exists.'));
    await settled();

    expect(el.querySelector('[role="alert"]')!.textContent).toContain('already exists');
    expect(navigate).not.toHaveBeenCalled();
  });
});
