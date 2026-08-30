import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-portal-shell',
  templateUrl: './portal-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Navbar],
  host: { class: 'relative block h-screen overflow-hidden' },
})
export class PortalShell {}
