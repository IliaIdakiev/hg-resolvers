import { Directive, Inject, Optional, OnDestroy, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Resolver } from './resolver';
import { AsyncRenderBase } from './resolve-base';
import { HG_RESOLVERS } from './injection-tokens';

@Directive({
  selector: '[hgResolve]',
  exportAs: 'hgResolve'
})
export class ResolveDirective extends AsyncRenderBase implements OnInit, OnDestroy {

  refresh$: Subject<void> = new Subject();

  constructor(
    @Inject(HG_RESOLVERS) @Optional() resolvers: Resolver<any>[] = [],
    viewContainerRef: ViewContainerRef,
    @Optional() templateRef: TemplateRef<any>,
  ) {
    super(resolvers);
    this.refresh$.subscribe(() => { this.resolve(); });
    if (!!templateRef) { viewContainerRef.createEmbeddedView(templateRef, { $implicit: this }); }
  }

  ngOnInit() {
    this.resolve();
  }

  ngOnDestroy() {
    this.refresh$.complete();
    this.destroy();
  }

}
