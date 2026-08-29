import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  LucideActivity,
  LucideAudioLines,
  LucideDynamicIcon,
  LucideHourglass,
  LucideRefreshCw,
} from '@lucide/angular';

import { DeploymentCall, DeploymentStatus, formatTalkClock } from '../../core/models/deploy-agent';

@Component({
  selector: 'app-deployment-feed',
  templateUrl: './deployment-feed.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
})
export class DeploymentFeed {
  readonly calls = input.required<DeploymentCall[]>();

  protected readonly icons = {
    activity: LucideActivity,
    waiting: LucideHourglass,
    calling: LucideRefreshCw,
    talking: LucideAudioLines,
  };

  protected readonly pendingCount = computed(
    () => this.calls().filter((call) => call.status !== 'talking').length,
  );
  protected readonly connectedCount = computed(
    () => this.calls().filter((call) => call.status === 'talking').length,
  );

  protected statusIcon(status: DeploymentStatus) {
    return this.icons[status];
  }

  protected statusLabel(call: DeploymentCall): string {
    if (call.status === 'talking') {
      return `Talking [${formatTalkClock(call.talkSeconds)}]`;
    }
    if (call.status === 'waiting') {
      return 'Waiting';
    }
    return 'Calling...';
  }

  protected statusTone(status: DeploymentStatus): 'amber' | 'neon' {
    return this.isTalking(status) ? 'neon' : 'amber';
  }

  protected isTalking(status: DeploymentStatus): boolean {
    return status === 'talking';
  }

  protected isSpinning(status: DeploymentStatus): boolean {
    return status === 'calling';
  }
}
