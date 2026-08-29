import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideDynamicIcon, LucideSettings } from '@lucide/angular';

import {
  DeploySettings,
  NEGOTIATION_STYLES,
  NegotiationStyle,
  styleLabel,
} from '../../core/models/deploy-agent';

@Component({
  selector: 'app-call-settings',
  templateUrl: './call-settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex h-full min-h-0 flex-col' },
  imports: [LucideDynamicIcon],
})
export class CallSettings {
  readonly settings = input.required<DeploySettings>();
  readonly patched = output<Partial<DeploySettings>>();

  protected readonly icons = { settings: LucideSettings };
  protected readonly styles = NEGOTIATION_STYLES;
  protected readonly styleName = styleLabel;

  protected onHook(event: Event): void {
    const field = event.target;
    if (!(field instanceof HTMLTextAreaElement)) {
      return;
    }
    this.patched.emit({ hook: field.value });
  }

  protected onStyle(style: NegotiationStyle): void {
    this.patched.emit({ style });
  }
}
