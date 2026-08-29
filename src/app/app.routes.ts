import { Routes } from '@angular/router';

import { Audit } from './features/audit/audit';
import { CarriersDirectory } from './features/carriers/carriers-directory';
import { Client } from './features/client/client';
import { ClientDirectory } from './features/client/client-directory';
import { DeployAgent } from './features/deploy-agent/deploy-agent';
import { Placeholder } from './features/placeholder/placeholder';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'carriers' },
  { path: 'carriers', component: CarriersDirectory },
  { path: 'command', component: Placeholder, data: { title: 'Command' } },
  { path: 'logs', component: Audit },
  { path: 'client', component: ClientDirectory },
  { path: 'client/:id', component: Client },
  { path: 'network', redirectTo: 'client' },
  { path: 'deploy', component: DeployAgent },
  { path: '**', redirectTo: 'carriers' },
];
