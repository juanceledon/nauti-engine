import { Routes } from '@angular/router';

import { Audit } from './features/audit/audit';
import { CarriersDirectory } from './features/carriers/carriers-directory';
import { DeployAgent } from './features/deploy-agent/deploy-agent';
import { Placeholder } from './features/placeholder/placeholder';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'carriers' },
  { path: 'carriers', component: CarriersDirectory },
  { path: 'command', component: Placeholder, data: { title: 'Command' } },
  { path: 'logs', component: Audit },
  { path: 'network', component: Placeholder, data: { title: 'Network' } },
  { path: 'deploy', component: DeployAgent },
  { path: '**', redirectTo: 'carriers' },
];
