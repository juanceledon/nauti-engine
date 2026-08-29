import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideCircleCheck, LucideDynamicIcon, LucideShield, LucideTrendingUp } from '@lucide/angular';

@Component({
  selector: 'app-audit-kpis',
  templateUrl: './audit-kpis.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
})
export class AuditKpis {
  readonly carriersContacted = input(0);
  readonly verifiedDeals = input(0);
  readonly complianceRate = input(0);

  protected readonly icons = {
    trend: LucideTrendingUp,
    check: LucideCircleCheck,
    shield: LucideShield,
  };
}
