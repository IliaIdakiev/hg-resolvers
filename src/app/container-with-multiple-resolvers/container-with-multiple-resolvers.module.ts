import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerWithMultipleResolversComponent } from './container-with-multiple-resolvers.component';
import { UserListResolverDirective } from './-resolvers/user-list.resolver';
import { SingleResolverRoutingModule } from './container-with-multiple-resolvers-routing.module';
import { HGResolversModule } from 'hg-resolvers';
import { PostListResolverDirective } from './-resolvers/post-list.resolver';
import {
  MatTableModule,
  MatButtonModule,
  MatProgressSpinnerModule,
  MatCardModule,
  MatDividerModule,
  MatGridListModule
} from '@angular/material';


@NgModule({
  declarations: [
    PostListResolverDirective,
    UserListResolverDirective,
    ContainerWithMultipleResolversComponent,
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
    // We need to add the HGResolversModule so we can use the resolve container
    HGResolversModule
  ],

})
export class ContainerWithMultipleResolversModule { }
