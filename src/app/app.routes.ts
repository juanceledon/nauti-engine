import { Routes } from '@angular/router';

import { Audit } from './features/audit/audit';
import { CarriersDirectory } from './features/carriers/carriers-directory';
import { Client } from './features/client/client';
import { ClientDirectory } from './features/client/client-directory';
import { DeployAgent } from './features/deploy-agent/deploy-agent';
import { Logs } from './features/logs/logs';
import { Placeholder } from './features/placeholder/placeholder';
import { QuoteHistory } from './features/quote-history/quote-history';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'carriers' },
  { path: 'carriers', component: CarriersDirectory },
  { path: 'command', component: Placeholder, data: { title: 'Command' } },
  { path: 'negotiations', component: Audit },
  { path: 'logs', component: Logs },
  { path: 'client', component: ClientDirectory },
  { path: 'client/:id', component: Client },
  { path: 'quote-history', component: QuoteHistory },
  { path: 'network', redirectTo: 'client' },
  { path: 'deploy', component: DeployAgent },
  { path: '**', redirectTo: 'carriers' },
];
