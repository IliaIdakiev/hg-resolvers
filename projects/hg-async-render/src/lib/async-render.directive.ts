import { Directive, Inject, Optional, OnDestroy, TemplateRef, ViewContainerRef, OnChanges, OnInit } from '@angular/core';
import { AsyncRenderResolver, HG_ASYNC_RENDER } from '../lib/async-render-resolver';
import { AsyncRenderBase } from './async-render-base';
import { Subject } from 'rxjs';

@Directive({
  selector: '[hgAsyncRender]',
  exportAs: 'asyncRender'
})
export class AsyncRenderDirective extends AsyncRenderBase implements OnInit, OnDestroy {

  refresh$: Subject<void> = new Subject();

  constructor(
    @Inject(HG_ASYNC_RENDER) @Optional() resolvers: AsyncRenderResolver[] = [],
    viewContainerRef: ViewContainerRef,
    templateRef: TemplateRef<any>,
  ) {
    super(resolvers);
    this.refresh$.subscribe(() => { this.resolve(); });
    viewContainerRef.createEmbeddedView(templateRef, { $implicit: this });
  }

  ngOnInit() {
    this.resolve();
  }

  ngOnDestroy() {
    this.refresh$.complete();
    this.destroy();
  }

}
