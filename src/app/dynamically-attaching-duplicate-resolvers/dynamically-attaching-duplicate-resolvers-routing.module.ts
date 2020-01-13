import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DynamicallyAttachingDuplicateResolversComponent } from './dynamically-attaching-duplicate-resolvers.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DynamicallyAttachingDuplicateResolversComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SingleResolverRoutingModule { }
