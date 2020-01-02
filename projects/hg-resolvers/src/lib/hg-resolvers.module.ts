import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResolveComponent } from './resolve/resolve.component';
import { ResolveDirective } from './resolve.directive';
import { ResolveAttachDirective } from './resolve-attach.directive';

@NgModule({
  declarations: [ResolveComponent, ResolveDirective, ResolveAttachDirective],
  imports: [
    CommonModule
  ],
  exports: [ResolveComponent, ResolveDirective, ResolveAttachDirective]
})
export class HGResolversModule { }
