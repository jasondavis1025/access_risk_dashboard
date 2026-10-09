import { AbstractControl, FormGroupDirective, NgForm, ValidationErrors } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export const MASTER_PASSWORD_MIN_LENGTH = 12;
export const MASTER_PASSWORD_MAX_LENGTH = 128;
export const EMAIL_MAX_LENGTH = 254;

/** Group validator: `masterPassword` and `confirmMasterPassword` must match. */
export function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('masterPassword')?.value;
  const confirm = group.get('confirmMasterPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

/** Shows the confirm field as invalid when the group reports a mismatch. */
export class ConfirmPasswordErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (!control || !(control.touched || form?.submitted)) {
      return false;
    }
    return control.invalid || !!control.parent?.hasError('passwordMismatch');
  }
}

/** Moves focus to the first invalid input so keyboard and screen reader users land on the problem. */
export function focusFirstInvalid(host: HTMLElement): void {
  host.querySelector<HTMLElement>('input.ng-invalid')?.focus();
}
