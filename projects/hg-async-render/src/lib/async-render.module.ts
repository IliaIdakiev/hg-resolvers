import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncRenderComponent } from './async-render/async-render.component';

@NgModule({
  declarations: [AsyncRenderComponent],
  imports: [
    CommonModule
  ],
  exports: [AsyncRenderComponent]
})
export class AsyncRenderModule { }
