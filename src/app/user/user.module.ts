import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { EntityComponent } from './entity/entity.component';
import { UserRoutingModule } from './user-routing.module';
import { UserListResolverDirective } from './-resolvers/list.resover';
import { MatTableModule } from '@angular/material';
import { AsyncRenderModule } from 'hg-async-render';
import { SharedModule } from '../shared/shared.module';
import { UserPostsResolverDirective } from './-resolvers/user-posts.resolver';

@NgModule({
  declarations: [
    ListComponent,
    EntityComponent,
    UserListResolverDirective,
    UserPostsResolverDirective
  ],
  imports: [
    CommonModule,
    MatTableModule,
    UserRoutingModule,
    SharedModule,
    AsyncRenderModule
  ]
})
export class UserModule { }
