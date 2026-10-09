import { Component, ElementRef, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { authErrorMessage } from '../auth.models';
import { AuthService } from '../auth.service';
import {
  ConfirmPasswordErrorStateMatcher,
  EMAIL_MAX_LENGTH,
  MASTER_PASSWORD_MAX_LENGTH,
  MASTER_PASSWORD_MIN_LENGTH,
  focusFirstInvalid,
  passwordsMatch,
} from '../auth-forms';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-signup',
  styleUrl: '../auth-form.scss',
  templateUrl: './signup.html',
})
export class Signup {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly minLength = MASTER_PASSWORD_MIN_LENGTH;
  protected readonly maxLength = MASTER_PASSWORD_MAX_LENGTH;
  protected readonly confirmErrorMatcher = new ConfirmPasswordErrorStateMatcher();

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      email: ['', [Validators.required, Validators.email, Validators.maxLength(EMAIL_MAX_LENGTH)]],
      masterPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(MASTER_PASSWORD_MIN_LENGTH),
          Validators.maxLength(MASTER_PASSWORD_MAX_LENGTH),
        ],
      ],
      confirmMasterPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showPassword = signal(false);
  protected readonly showConfirm = signal(false);

  protected async submit(): Promise<void> {
    if (this.submitting()) {
      return;
    }
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      focusFirstInvalid(this.host.nativeElement);
      return;
    }

    this.submitting.set(true);
    const { email, masterPassword } = this.form.getRawValue();
    try {
      const session = await this.auth.signup({ email, masterPassword });
      this.snackBar.open(`Demo account created for ${session.email}.`, undefined, {
        duration: 4000,
      });
      await this.router.navigateByUrl('/vault');
    } catch (error) {
      this.errorMessage.set(authErrorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
