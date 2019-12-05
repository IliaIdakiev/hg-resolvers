import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { EntityComponent } from './entity/entity.component';



@NgModule({
  declarations: [ListComponent, EntityComponent],
  imports: [
    CommonModule
  ]
})
export class PostModule { }
