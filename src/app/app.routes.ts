import { Routes } from '@angular/router';
import {CallbackComponent} from "./callback/callback.component";
import {authGuard} from "./guard/auth.guard";
import {EmployeeListComponent} from "./employee-list/employee-list.component";
import {HomeComponent} from "./components/home/home.component";
import {LoginComponent} from "./components/login/login.component";

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'employees', component: EmployeeListComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
