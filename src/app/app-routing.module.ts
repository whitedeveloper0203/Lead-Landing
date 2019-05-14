import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'home/demos', 
    pathMatch: 'full' 
  },
  { 
    path: 'home', 
    loadChildren: './views/home/home.module#HomeModule'
  },
  { 
    path: '**', 
    redirectTo: 'home/one'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
