import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SingleResolverComponent } from './single-resolver.component';



const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: SingleResolverComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SingleResolverRoutingModule { }
