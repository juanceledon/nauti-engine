import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideCircleHelp,
  LucideDynamicIcon,
  LucideFileText,
  LucideLayoutDashboard,
  LucideNetwork,
  LucideRocket,
  LucideTruck,
  LucideUserRound,
  LucideZap,
} from '@lucide/angular';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, LucideDynamicIcon],
})
export class Navbar {
  protected readonly icons = {
    zap: LucideZap,
    command: LucideLayoutDashboard,
    logs: LucideFileText,
    truck: LucideTruck,
    network: LucideNetwork,
    rocket: LucideRocket,
    help: LucideCircleHelp,
    account: LucideUserRound,
  };
}
