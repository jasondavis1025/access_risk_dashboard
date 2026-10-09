import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { AuthService } from './auth/auth.service';
import { StubAuthService } from './auth/testing/stub-auth.service';

describe('App', () => {
  let auth: StubAuthService;

  beforeEach(async () => {
    auth = new StubAuthService();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Access Risk Dashboard');
  });

  it('labels authentication as a demo', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const notice = (fixture.nativeElement as HTMLElement).querySelector('.demo-notice');
    expect(notice?.textContent).toContain('provides no real security');
  });

  it('shows log in and sign up links when signed out', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const links = [...(fixture.nativeElement as HTMLElement).querySelectorAll('nav a')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/login', '/signup']);
  });

  it('logs out and returns to /login', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    auth.sessionState.set({ email: 'a@example.com' });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="signed-in-email"]')?.textContent).toBe('a@example.com');

    el.querySelector<HTMLButtonElement>('nav button')!.click();
    await fixture.whenStable();

    expect(auth.session()).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/login');
    expect(el.querySelector('nav button')).toBeNull();
  });
});
