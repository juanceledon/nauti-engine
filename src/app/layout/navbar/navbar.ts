import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideCircleHelp,
  LucideDynamicIcon,
  LucideLayoutDashboard,
  LucideNetwork,
  LucideRocket,
  LucideShieldCheck,
  LucideTruck,
  LucideUserRound,
} from '@lucide/angular';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, LucideDynamicIcon],
})
export class Navbar {
  protected readonly icons = {
    command: LucideLayoutDashboard,
    logs: LucideShieldCheck,
    truck: LucideTruck,
    network: LucideNetwork,
    rocket: LucideRocket,
    help: LucideCircleHelp,
    account: LucideUserRound,
  };
}
