import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService, readAuthError } from '../../core/auth/auth.service';
import { ThemeToggle } from '../../layout/theme-toggle/theme-toggle';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, ThemeToggle],
  host: { class: 'block min-h-screen' },
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected async submit(): Promise<void> {
    if (this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    try {
      await this.auth.login(this.email, this.password);
      await this.router.navigateByUrl(this.auth.homePath());
    } catch (err) {
      this.error.set(readAuthError(err));
    } finally {
      this.submitting.set(false);
    }
  }
}
