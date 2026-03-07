import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { DashboardHome } from './features/dashboard/dashboard-home/dashboard-home';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'dashboard', component: DashboardHome }, // Luego le pondremos seguridad (Guards)
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
