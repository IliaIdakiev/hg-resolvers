import { Directive, Inject, OnDestroy, Optional } from '@angular/core';
import { ResolveComponent } from './resolve/resolve.component';
import { Resolver } from './resolver';
import { HG_RESOLVERS } from './injection-tokens';
import { AsyncRenderBase } from './resolve-base';
import { ResolveDirective } from './resolve.directive';

@Directive({
  selector: '[hgResolveAttach]'
})
export class ResolveAttachDirective<T> implements OnDestroy {

  container: AsyncRenderBase;

  constructor(
    @Optional() resolveCmpInstance: ResolveComponent,
    @Optional() resolveDirInstance: ResolveDirective,
    @Inject(HG_RESOLVERS) private resolvers: Resolver<T>[]
  ) {
    this.container = resolveCmpInstance || resolveDirInstance || null;
    if (!this.container) {
      console.warn('hg-resolvers: No async render found!');
      return;
    }
    this.resolvers.map(r => {
      (r as any).parentContainer = this.container;
      this.container.attachResolver(r);
    });
  }

  ngOnDestroy() {
    this.resolvers.map(r => this.container.detachResolver(r));
  }

}
