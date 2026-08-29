import { Routes } from '@angular/router';

import { CarriersDirectory } from './features/carriers/carriers-directory';
import { Placeholder } from './features/placeholder/placeholder';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'carriers' },
  { path: 'carriers', component: CarriersDirectory },
  { path: 'command', component: Placeholder, data: { title: 'Command' } },
  { path: 'logs', component: Placeholder, data: { title: 'Logs' } },
  { path: 'network', component: Placeholder, data: { title: 'Network' } },
  { path: '**', redirectTo: 'carriers' },
];
