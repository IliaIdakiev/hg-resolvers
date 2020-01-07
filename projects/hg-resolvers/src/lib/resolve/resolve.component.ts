import { Component, Input, OnDestroy, Inject, TemplateRef, Optional, OnInit, DoCheck } from '@angular/core';
import { Subject } from 'rxjs';
import { Resolver } from '../resolver';
import { ResolverBase } from '../resolve-base';
import { HG_RESOLVERS } from '../injection-tokens';

@Component({
  selector: 'hg-resolve',
  templateUrl: './resolve.component.html',
  styleUrls: ['./resolve.component.scss'],
  exportAs: 'hgResolve'
})
export class ResolveComponent extends ResolverBase implements OnInit, DoCheck, OnDestroy {

  refresh$: Subject<void> = new Subject();

  @Input() resolveOnInit = false;

  @Input() loaderTemplateRef: TemplateRef<any>;
  @Input() errorTemplateRef: TemplateRef<any>;
  @Input() autoControlLoader = false;
  @Input() autoControlError = false;
  @Input() hideContentUntilResolvedSuccessfully = true;
  @Input() discardSkippedResolvers = true;

  isResolved: boolean;
  isResolvedSuccessfully: boolean;
  isLoading: boolean;
  isErrored: boolean;

  constructor(@Inject(HG_RESOLVERS) @Optional() resolvers: Resolver<any>[] = []) {
    super(resolvers);
    (resolvers || []).forEach(r => (r as any).parentContainer = this);
    this.refresh$.subscribe(() => { this.resolve(); });
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
