import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerWithMultipleResolversWithDependenciesComponent } from './container-with-multiple-resolvers-with-dependencies.component';
import { UserListResolverDirective } from './-resolvers/user-list.resolver';
import { SingleResolverRoutingModule } from './container-with-multiple-resolvers-with-dependencies-routing.module';
import { HGResolversModule } from 'hg-resolvers';
import { PostListResolverDirective } from './-resolvers/post-list.resolver';
import { UserPostsResolverDirective } from '../-resolvers/user-posts.resolver';


@NgModule({
  declarations: [
    PostListResolverDirective,
    UserListResolverDirective,
    UserPostsResolverDirective,
    ContainerWithMultipleResolversWithDependenciesComponent,
  ],
  imports: [
    CommonModule,
    SingleResolverRoutingModule,
    // We need to add the HGResolversModule so we can use the resolve container
    HGResolversModule
  ],

})
export class ContainerWithMultipleResolversWithDependenciesModule { }
