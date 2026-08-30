import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService, readAuthError } from '../../core/auth/auth.service';
import { DIAL_CODES, joinPhone } from '../../core/utils/phone';
import { ThemeToggle } from '../../layout/theme-toggle/theme-toggle';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, ThemeToggle],
  host: { class: 'block min-h-screen' },
})
export class Signup {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected name = '';
  protected contactName = '';
  protected email = '';
  protected password = '';
  protected readonly dialCodes = DIAL_CODES;
  protected readonly dialCode = signal('+52');
  protected readonly localNumber = signal('');
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected onDialInput(event: Event): void {
    const field = event.target;
    if (field instanceof HTMLInputElement) {
      this.dialCode.set(field.value);
    }
  }

  protected onLocalNumber(event: Event): void {
    const field = event.target;
    if (field instanceof HTMLInputElement) {
      this.localNumber.set(field.value.replace(/\D/g, ''));
    }
  }

  protected async submit(): Promise<void> {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.auth.signup({
        email: this.email,
        password: this.password,
        name: this.name,
        contactName: this.contactName,
        contactPhone: joinPhone(this.dialCode(), this.localNumber()),
      });
      await this.router.navigateByUrl(this.auth.homePath());
    } catch (err) {
      this.error.set(readAuthError(err));
    } finally {
      this.submitting.set(false);
    }
  }
}
