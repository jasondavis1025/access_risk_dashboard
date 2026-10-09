import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../auth/auth.service';

/** Placeholder shown after (simulated) authentication. */
@Component({
  imports: [MatCardModule],
  selector: 'app-vault',
  styles: `
    h2 {
      font: var(--mat-sys-headline-small);
      margin: 0;
    }
  `,
  templateUrl: './vault.html',
})
export class Vault {
  protected readonly session = inject(AuthService).session;
}
