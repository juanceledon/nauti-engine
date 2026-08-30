import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  LucideActivity,
  LucideAudioLines,
  LucideCircleCheck,
  LucideDynamicIcon,
  LucideHourglass,
  LucidePhone,
  LucidePhoneOff,
  LucideRefreshCw,
} from '@lucide/angular';

import {
  DeploymentCall,
  DeploymentStatus,
  liveCallStatusLabel,
} from '../../core/models/deploy-agent';

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
    registered: LucidePhone,
    talking: LucideAudioLines,
    ended: LucideCircleCheck,
    failed: LucidePhoneOff,
  };

  protected readonly pendingCount = computed(
    () => this.calls().filter((call) => call.status === 'waiting' || call.status === 'calling' || call.status === 'registered').length,
  );
  protected readonly connectedCount = computed(
    () => this.calls().filter((call) => call.status === 'talking').length,
  );

  protected statusIcon(status: DeploymentStatus) {
    return this.icons[status];
  }

  protected statusLabel(call: DeploymentCall): string {
    return liveCallStatusLabel(call.status, call.talkSeconds);
  }

  protected statusTone(status: DeploymentStatus): 'amber' | 'neon' | 'muted' | 'danger' {
    if (status === 'talking') {
      return 'neon';
    }
    if (status === 'ended') {
      return 'muted';
    }
    if (status === 'failed') {
      return 'danger';
    }
    return 'amber';
  }

  protected isTalking(status: DeploymentStatus): boolean {
    return status === 'talking';
  }

  protected isSpinning(status: DeploymentStatus): boolean {
    return status === 'calling';
  }
}
