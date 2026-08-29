import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideDynamicIcon, LucideMail, LucidePhone, LucideUserRound, LucideX } from '@lucide/angular';

import { Carrier } from '../../core/models/carrier';
import { Quote } from '../../core/models/quote';
import { carrierInitials } from '../../core/utils/initials';

@Component({
  selector: 'app-carrier-detail',
  templateUrl: './carrier-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, LucideDynamicIcon],
})
export class CarrierDetail {
  readonly carrier = input.required<Carrier>();
  readonly quotes = input<Quote[]>([]);
  readonly closed = output<void>();
  readonly edit = output<void>();

  protected readonly icons = {
    mail: LucideMail,
    phone: LucidePhone,
    user: LucideUserRound,
    close: LucideX,
  };
  protected readonly initials = computed(() => carrierInitials(this.carrier().name));

  protected quoteTone(status: string): 'success' | 'error' | 'neutral' {
    if (status === 'within_mandate') {
      return 'success';
    }
    if (status === 'exceeds_mandate') {
      return 'error';
    }
    return 'neutral';
  }

  protected quoteLabel(status: string): string {
    if (status === 'within_mandate') {
      return 'SUCCESS';
    }
    if (status === 'exceeds_mandate') {
      return 'FAILED';
    }
    return status.replaceAll('_', ' ').toUpperCase();
  }
}
