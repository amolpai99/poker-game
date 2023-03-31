import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from '../login/login.component';
import { TableComponent } from '../table/table.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'table', component: TableComponent},
  {path: '', redirectTo: 'table', pathMatch: 'full'}
]


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
  
})
export class AppRoutingModule { }
