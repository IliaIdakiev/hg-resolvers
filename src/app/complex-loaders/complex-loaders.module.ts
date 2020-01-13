import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplexLoadersComponent } from './complex-loaders.component';
import { UserListResolverDirective } from './-resolvers/user-list.resolver';
import { SingleResolverRoutingModule } from './complex-loaders-routing.module';
import { HGResolversModule } from 'hg-resolvers';
import { PostListResolverDirective } from './-resolvers/post-list.resolver';
import { UserPostsResolverDirective } from './-resolvers/user-posts.resolver';

@NgModule({
  declarations: [
    PostListResolverDirective,
    UserListResolverDirective,
    UserPostsResolverDirective,
    ComplexLoadersComponent,
  ],
  imports: [
    CommonModule,
    SingleResolverRoutingModule,
    // We need to add the HGResolversModule so we can use the resolve container and the attach directive
    HGResolversModule
  ],

})
export class ComplexLoadersModule { }
