import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { EntityComponent } from './entity/entity.component';
import { PostUserResolverDirective } from './-resolvers/post-user.resolver';
import { PostsListResolverDirective } from './-resolvers/list.resolver';
import { PostRoutingModule } from './post-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MatTableModule } from '@angular/material';
import { AsyncRenderModule } from 'hg-async-render';

@NgModule({
  declarations: [
    ListComponent,
    EntityComponent,
    PostsListResolverDirective,
    PostUserResolverDirective
  ],
  imports: [
    CommonModule,
    PostRoutingModule,
    MatTableModule,
    SharedModule,
    AsyncRenderModule
  ]
})
export class PostModule { }
