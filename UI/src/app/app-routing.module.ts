import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ListComponent } from './list/list.component';

import { LoggedInGuard } from './logged-in.guard';  
import { LoggedOutGuard } from './logged-out.guard'; 
import { EditUserComponent } from './edit-user/edit-user.component';
import { VerificationMailComponent } from './verification-mail/verification-mail.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  {path:'list',component:ListComponent, canActivate:[LoggedInGuard] },
  {path: 'edit-user', component: EditUserComponent, canActivate:[LoggedInGuard] },

  {path:'',component:LoginComponent, canActivate:[LoggedOutGuard] },
  {path:'save',component:HomeComponent, canActivate:[LoggedOutGuard]},
  {path:'verification-mail', component:VerificationMailComponent, canActivate:[LoggedOutGuard]},
  {path:'forgotPassword',component:ForgetPasswordComponent, canActivate:[LoggedOutGuard]},
  {path:'resetPassword', component:ResetPasswordComponent, canActivate:[LoggedOutGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
