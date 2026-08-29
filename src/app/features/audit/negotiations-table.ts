import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  LucideCircleCheck,
  LucideDownload,
  LucideDynamicIcon,
  LucideHourglass,
} from '@lucide/angular';

import { formatMoney, NegotiationRow } from '../../core/models/audit';

@Component({
  selector: 'app-negotiations-table',
  templateUrl: './negotiations-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-0 min-w-0 flex-1 flex-col' },
  imports: [LucideDynamicIcon],
})
export class NegotiationsTable {
  readonly rows = input.required<NegotiationRow[]>();
  readonly selectedId = input<string | null>(null);
  readonly loading = input(false);
  readonly loadError = input<string | null>(null);
  readonly hasAny = input(false);
  readonly selected = output<string>();
  readonly exportRequested = output<void>();

  protected readonly icons = {
    download: LucideDownload,
    check: LucideCircleCheck,
    hourglass: LucideHourglass,
  };
  protected readonly money = formatMoney;

  protected isSelected(id: string): boolean {
    return this.selectedId() === id;
  }

  protected hasPriceDrop(row: NegotiationRow): boolean {
    return row.initialPrice !== null && row.initialPrice !== row.negotiatedPrice;
  }
}
