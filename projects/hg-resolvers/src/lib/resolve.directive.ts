import { Directive, Inject, Optional, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { Resolver } from './resolver';
import { ResolveBase } from './resolve-base';
import { HG_RESOLVERS } from './injection-tokens';

@Directive({
  selector: '[hgResolve]',
  exportAs: 'hgResolve'
})
export class ResolveDirective extends ResolveBase {

  refresh$: Subject<void>;

  @Input() resolveOnInit = true;
  @Input() discardSkippedResolvers = true;

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
