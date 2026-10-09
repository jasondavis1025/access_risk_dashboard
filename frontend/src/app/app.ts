import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth/auth.service';

interface HealthResponse {
  status: string;
}

@Component({
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly session = this.auth.session;

  // Requests go through the dev-server proxy (proxy.conf.json) to the backend.
  protected readonly apiStatus = toSignal(
    this.http.get<HealthResponse>('/api/health').pipe(
      map((res) => res.status),
      catchError(() => of('Unreachable')),
    ),
    { initialValue: 'Checking…' },
  );

  protected async logout(): Promise<void> {
    this.auth.logout();
    await this.router.navigateByUrl('/login');
    this.snackBar.open('Logged out.', undefined, { duration: 3000 });
  }
}
