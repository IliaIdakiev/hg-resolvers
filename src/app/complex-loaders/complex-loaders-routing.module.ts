import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComplexLoadersComponent } from './complex-loaders.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ComplexLoadersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SingleResolverRoutingModule { }
