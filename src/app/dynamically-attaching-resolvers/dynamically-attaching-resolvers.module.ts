import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicallyAttachingResolversComponent } from './dynamically-attaching-resolvers.component';
import { UserListResolverDirective } from './-resolvers/user-list.resolver';
import { SingleResolverRoutingModule } from './dynamically-attaching-resolvers-routing.module';
import { HGResolversModule } from 'hg-resolvers';
import { PostListResolverDirective } from './-resolvers/post-list.resolver';
import { UserPostsResolverDirective } from './-resolvers/user-posts.resolver';

@NgModule({
  declarations: [
    PostListResolverDirective,
    UserListResolverDirective,
    UserPostsResolverDirective,
    DynamicallyAttachingResolversComponent,
  ],
  imports: [
    CommonModule,
    SingleResolverRoutingModule,
    // We need to add the HGResolversModule so we can use the resolve container and the attach directive
    HGResolversModule
  ],

})
export class DynamicallyAttachingResolversModule { }
