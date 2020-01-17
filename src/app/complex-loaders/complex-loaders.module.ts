import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplexLoadersComponent } from './complex-loaders.component';
import { UserListResolverDirective } from './-resolvers/user-list.resolver';
import { SingleResolverRoutingModule } from './complex-loaders-routing.module';
import { HGResolversModule } from 'hg-resolvers';
import { PostListResolverDirective } from './-resolvers/post-list.resolver';
import { UserPostsResolverDirective } from './-resolvers/user-posts.resolver';
import {
  MatTableModule,
  MatButtonModule,
  MatProgressSpinnerModule,
  MatCardModule,
  MatDividerModule,
  MatGridListModule
} from '@angular/material';
import { SpinnerComponent } from './spinner/spinner.component';

@NgModule({
  declarations: [
    PostListResolverDirective,
    UserListResolverDirective,
    UserPostsResolverDirective,
    ComplexLoadersComponent,
    SpinnerComponent,
  ],
  imports: [
    CommonModule,
    SingleResolverRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatGridListModule,
    // We need to add the HGResolversModule so we can use the resolve container and the attach directive
    HGResolversModule
  ],

})
export class ComplexLoadersModule { }
