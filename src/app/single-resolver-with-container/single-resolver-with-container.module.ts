import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SingleResolverWithContainerComponent } from './single-resolver-with-container.component';
import { UserListResolverDirective } from './-resolvers/user-list.resolver';
import { SingleResolverRoutingModule } from './single-resolver-with-container-routing.module';
import { HGResolversModule } from 'hg-resolvers';
import { MatTableModule, MatButtonModule, MatProgressSpinnerModule, MatCardModule, MatDividerModule } from '@angular/material';


@NgModule({
  declarations: [
    UserListResolverDirective,
    SingleResolverWithContainerComponent
  ],
  imports: [
    CommonModule,
    SingleResolverRoutingModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    // We need to add the HGResolversModule so we can use the resolve container
    HGResolversModule
  ],

})
export class SingleResolverWithContainerModule { }
