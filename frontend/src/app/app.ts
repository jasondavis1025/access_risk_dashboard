import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { catchError, map, of } from 'rxjs';

interface HealthResponse {
  status: string;
}

@Component({
  imports: [MatToolbarModule, MatCardModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly http = inject(HttpClient);

  // Requests go through the dev-server proxy (proxy.conf.json) to the backend.
  protected readonly apiStatus = toSignal(
    this.http.get<HealthResponse>('/api/health').pipe(
      map((res) => res.status),
      catchError(() => of('Unreachable')),
    ),
    { initialValue: 'Checking…' },
  );
}
