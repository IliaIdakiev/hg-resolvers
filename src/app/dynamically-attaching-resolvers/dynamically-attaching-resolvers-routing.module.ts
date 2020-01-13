import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DynamicallyAttachingResolversComponent } from './dynamically-attaching-resolvers.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DynamicallyAttachingResolversComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SingleResolverRoutingModule { }
