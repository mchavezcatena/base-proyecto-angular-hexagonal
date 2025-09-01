import { Routes } from '@angular/router';
import {
  LoginPage,
  HomePage,
  UserMaintainerPage,
  RoleMaintainerPage,
  AssignRolesPage
} from './presentation';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'home', component: HomePage },
  { path: 'users', component: UserMaintainerPage },
  { path: 'roles', component: RoleMaintainerPage },
  { path: 'assign-roles', component: AssignRolesPage },
  { path: '**', redirectTo: '/home' }
];
