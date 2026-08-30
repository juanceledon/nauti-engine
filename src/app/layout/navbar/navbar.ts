import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideCircleHelp,
  LucideDynamicIcon,
  LucideHandshake,
  LucideLayoutDashboard,
  LucideRocket,
  LucideTruck,
  LucideUserRound,
  LucideUsers,
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
    negotiations: LucideHandshake,
    truck: LucideTruck,
    client: LucideUsers,
    rocket: LucideRocket,
    help: LucideCircleHelp,
    account: LucideUserRound,
  };
}
