import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SingleResolverWithContainerComponent } from './single-resolver-with-container.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: SingleResolverWithContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SingleResolverRoutingModule { }
