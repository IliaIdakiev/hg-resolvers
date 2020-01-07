import { Directive, Inject, Optional, OnDestroy, TemplateRef, ViewContainerRef, OnInit, Input, DoCheck } from '@angular/core';
import { Subject } from 'rxjs';
import { Resolver } from './resolver';
import { ResolverBase } from './resolve-base';
import { HG_RESOLVERS } from './injection-tokens';

@Directive({
  selector: '[hgResolve]',
  exportAs: 'hgResolve'
})
export class ResolveDirective extends ResolverBase implements OnInit, DoCheck, OnDestroy {

  refresh$: Subject<void> = new Subject();

  @Input() resolveOnInit = false;
  @Input() discardSkippedResolvers = true;

  isResolved: boolean;
  isResolvedSuccessfully: boolean;
  isLoading: boolean;
  isErrored: boolean;

  constructor(
    @Inject(HG_RESOLVERS) @Optional() resolvers: Resolver<any>[] = [],
    viewContainerRef: ViewContainerRef,
    @Optional() templateRef: TemplateRef<any>,
  ) {
    super(resolvers);
    (resolvers || []).forEach(r => (r as any).parentContainer = this);
    this.refresh$.subscribe(() => { this.resolve(); });
    if (!!templateRef) { viewContainerRef.createEmbeddedView(templateRef, { $implicit: this }); }
  }

  ngOnInit() {
    if (this.resolveOnInit) { this.resolve(); }
  }

  ngDoCheck() {
    const state = this.calculateState();
    this.isResolved = state.isResolved;
    this.isResolvedSuccessfully = state.isResolvedSuccessfully;
    this.isErrored = state.isErrored;
    this.isLoading = state.isLoading;
  }

  ngOnDestroy() {
    this.refresh$.complete();
    this.destroy();
  }

}
