import { Routes } from '@angular/router';
import {CallbackComponent} from "./callback/callback.component";
import {authGuard} from "./guard/auth.guard";
import {EmployeeListComponent} from "./components/employee-list/employee-list.component";
import {HomeComponent} from "./components/home/home.component";
import {QualificationListComponent} from "./components/qualification-list/qualification-list.component";
import {EmployeeDetailsComponent} from "./components/employee-details/employee-details.component";
import {QualificationDetailsComponent} from "./components/qualification-details/qualification-details.component";

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'callback', component: CallbackComponent },
  { path: 'employees', component: EmployeeListComponent, canActivate: [authGuard] },
  { path: 'employees/:id', component: EmployeeDetailsComponent, canActivate: [authGuard] },
  { path: 'qualifications', component: QualificationListComponent, canActivate: [authGuard] },
  { path: 'qualifications/:id', component: QualificationDetailsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
