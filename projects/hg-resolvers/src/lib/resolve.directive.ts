import { Directive, Inject, Optional, OnDestroy, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { Subject, asapScheduler } from 'rxjs';
import { Resolver } from './resolver';
import { ResolverBase } from './resolve-base';
import { HG_RESOLVERS } from './injection-tokens';

@Directive({
  selector: '[hgResolve]',
  exportAs: 'hgResolve'
})
export class ResolveDirective extends ResolverBase {

  refresh$: Subject<void>;

  @Input() resolveOnInit = false;
  @Input() discardSkippedResolvers = true;

  isResolved = false;
  isResolvedSuccessfully = false;
  isLoading = false;
  isErrored = false;

  constructor(
    @Inject(HG_RESOLVERS) @Optional() resolvers: Resolver<any>[] = [],
    viewContainerRef: ViewContainerRef,
    @Optional() templateRef: TemplateRef<any>
  ) {
    super(resolvers);
    (resolvers || []).forEach(r => (r as any).parentContainer = this);
    this.refresh$.subscribe(() => { this.resolve(); });
    if (!!templateRef) { viewContainerRef.createEmbeddedView(templateRef, { $implicit: this }); }
  }
}
