import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth.guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'signup',
    title: 'Sign up | Access Risk Dashboard',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/signup/signup').then((m) => m.Signup),
  },
  {
    path: 'login',
    title: 'Log in | Access Risk Dashboard',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'vault',
    title: 'Vault | Access Risk Dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./vault/vault').then((m) => m.Vault),
  },
  { path: '**', redirectTo: 'login' },
];
