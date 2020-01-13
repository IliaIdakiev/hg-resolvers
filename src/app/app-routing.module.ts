import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { AboutComponent } from './about/about.component';
import { UserListResolver } from './user-list.resolver';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'single-resolver'
  },
  {
    path: 'single-resolver',
    loadChildren: () => import('./single-resolver/single-resolver.module').then(m => m.SingleResolverModule)
  },
  {
    path: 'single-resolver-with-container',
    loadChildren: () => import('./single-resolver-with-container/single-resolver-with-container.module')
      .then(m => m.SingleResolverWithContainerModule)
  },
  {
    path: 'container-with-multiple-resolvers',
    loadChildren: () => import('./container-with-multiple-resolvers/container-with-multiple-resolvers.module')
      .then(m => m.ContainerWithMultipleResolversModule)
  },
  {
    path: 'container-with-multiple-resolvers-with-dependencies',
    loadChildren: () =>
      import('./container-with-multiple-resolvers-with-dependencies/container-with-multiple-resolvers-with-dependencies.module')
        .then(m => m.ContainerWithMultipleResolversWithDependenciesModule)
  },
  {
    path: 'dynamically-attaching-resolvers',
    loadChildren: () =>
      import('./dynamically-attaching-resolvers/dynamically-attaching-resolvers.module')
        .then(m => m.DynamicallyAttachingResolversModule)
  },
  {
    path: 'dynamically-attaching-duplicate-resolvers',
    loadChildren: () =>
      import('./dynamically-attaching-duplicate-resolvers/dynamically-attaching-duplicate-resolvers.module')
        .then(m => m.DynamicallyAttachingDuplicateResolversModule)
  },
  {
    path: 'complex-loaders',
    loadChildren: () =>
      import('./complex-loaders/complex-loaders.module')
        .then(m => m.ComplexLoadersModule)
  },
  {
    path: 'about',
    component: AboutComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
