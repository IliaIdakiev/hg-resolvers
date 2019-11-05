import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncRenderComponent } from './async-render/async-render.component';
import { AsyncRenderDirective } from './async-render.directive';

@NgModule({
  declarations: [AsyncRenderComponent, AsyncRenderDirective],
  imports: [
    CommonModule
  ],
  exports: [AsyncRenderComponent, AsyncRenderDirective]
})
export class AsyncRenderModule { }
