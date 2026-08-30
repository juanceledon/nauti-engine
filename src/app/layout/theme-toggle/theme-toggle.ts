import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { LucideDynamicIcon, LucideMoon, LucideSun } from '@lucide/angular';

import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
})
export class ThemeToggle {
  readonly compact = input(false);

  private readonly theme = inject(ThemeService);

  protected readonly mode = this.theme.theme;
  protected readonly icons = {
    sun: LucideSun,
    moon: LucideMoon,
  };

  protected toggle(): void {
    this.theme.toggle();
  }
}
