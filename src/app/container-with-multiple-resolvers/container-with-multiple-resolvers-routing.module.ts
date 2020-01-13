import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContainerWithMultipleResolversComponent } from './container-with-multiple-resolvers.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ContainerWithMultipleResolversComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SingleResolverRoutingModule { }
