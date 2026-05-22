import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 's/:token',
    loadComponent: () =>
      import('./pages/shared-statement/shared-statement.page').then(
        (m) => m.SharedStatementPage,
      ),
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'loans',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/loans/loans.page').then((m) => m.LoansPage),
  },
  {
    path: 'loans/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/edit-loan/edit-loan.page').then((m) => m.EditLoanPage),
  },
  {
    path: 'bills',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/bills/bills.page').then((m) => m.BillsPage),
  },
  {
    path: 'statement',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/statement/statement.page').then((m) => m.StatementPage),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/settings/settings.page').then((m) => m.SettingsPage),
  },

  { path: '**', redirectTo: 'dashboard' },
];
