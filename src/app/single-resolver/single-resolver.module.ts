import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SingleResolverComponent } from './single-resolver.component';
import { UserListResolverDirective } from './-resolvers/user-list.resolver';
import { SingleResolverRoutingModule } from './single-resolver-routing.module';


@NgModule({
  declarations: [
    UserListResolverDirective,
    SingleResolverComponent
  ],
  imports: [
    CommonModule,
    SingleResolverRoutingModule
  ],

})
export class SingleResolverModule { }
