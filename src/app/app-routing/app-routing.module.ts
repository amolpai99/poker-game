import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from '../login/login.component';
import { GameComponent } from '../game/game.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'game/:game_id', component: GameComponent},
  {path: '', redirectTo: 'login', pathMatch: 'full'}
]


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
  
})
export class AppRoutingModule { }
