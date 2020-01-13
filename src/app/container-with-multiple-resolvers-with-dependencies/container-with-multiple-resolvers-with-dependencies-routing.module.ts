import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContainerWithMultipleResolversWithDependenciesComponent } from './container-with-multiple-resolvers-with-dependencies.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ContainerWithMultipleResolversWithDependenciesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SingleResolverRoutingModule { }
