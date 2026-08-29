import { Routes } from '@angular/router';

import {
  CarriersDirectory
} from './features/carriers/carriers-directory';

import {
  Placeholder
} from './features/placeholder/placeholder';

import {
  ClientDirectory
} from './features/client/client-directory';

import {
  Client
} from './features/client/client';

export const routes: Routes = [

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'carriers'
  },

  {
    path: 'carriers',
    component: CarriersDirectory
  },

  {
    path: 'command',
    component: Placeholder,
    data: {
      title: 'Command'
    }
  },

  {
    path: 'logs',
    component: Placeholder,
    data: {
      title: 'Logs'
    }
  },

  {
    path: 'client',
    component: ClientDirectory
  },

  {
    path: 'client/:id',
    component: Client
  },

  {
    path: 'network',
    redirectTo: 'client'
  },

  {
    path: '**',
    redirectTo: 'carriers'
  }

];