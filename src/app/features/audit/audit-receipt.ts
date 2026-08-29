import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  LucideCircleCheck,
  LucideDynamicIcon,
  LucideMessageSquare,
  LucidePlay,
} from '@lucide/angular';

import { formatAuditClock, formatMoney, NegotiationRow } from '../../core/models/audit';

@Component({
  selector: 'app-audit-receipt',
  templateUrl: './audit-receipt.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex h-full min-h-0 flex-col' },
  imports: [LucideDynamicIcon],
})
export class AuditReceipt {
  readonly row = input<NegotiationRow | null>(null);

  protected readonly icons = {
    play: LucidePlay,
    message: LucideMessageSquare,
    check: LucideCircleCheck,
  };
  protected readonly money = formatMoney;
  protected readonly clock = formatAuditClock;

  protected readonly recapTo = computed(() => {
    const row = this.row();
    if (!row) {
      return '';
    }
    if (row.clientPhone && row.clientName) {
      return `${row.clientPhone} (${row.clientName})`;
    }
    return row.clientPhone || row.clientName || 'Unknown recipient';
  });

  protected readonly hasAgreement = computed(() => {
    const row = this.row();
    return Boolean(row?.agreedName);
  });
}
