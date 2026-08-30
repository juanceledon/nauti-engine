import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home-redirect',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeRedirect implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.auth.whenReady();
    if (!this.auth.appUser()) {
      await this.router.navigateByUrl('/login');
      return;
    }
    await this.router.navigateByUrl(this.auth.homePath());
  }
}
