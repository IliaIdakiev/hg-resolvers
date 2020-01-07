import { Component, Input, OnDestroy, Inject, TemplateRef, Optional, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Resolver } from '../resolver';
import { AsyncRenderBase } from '../resolve-base';
import { HG_RESOLVERS } from '../injection-tokens';

@Component({
  selector: 'hg-resolve',
  templateUrl: './resolve.component.html',
  styleUrls: ['./resolve.component.scss'],
  exportAs: 'hgResolve'
})
export class ResolveComponent extends AsyncRenderBase implements OnInit, OnDestroy {

  refresh$: Subject<void> = new Subject();

  @Input() resolveOnInit = false;

  @Input() loaderTemplateRef: TemplateRef<any>;
  @Input() errorTemplateRef: TemplateRef<any>;
  @Input() autoControlLoader = false;
  @Input() autoControlError = false;
  @Input() hideContentUntilResolvedSuccessfully = true;

  constructor(@Inject(HG_RESOLVERS) @Optional() resolvers: Resolver<any>[] = []) {
    super(resolvers);
    (resolvers || []).forEach(r => (r as any).parentContainer = this);
    this.refresh$.subscribe(() => { this.resolve(); });
  }

  ngOnInit() {
    if (this.resolveOnInit) { this.resolve(); }
  }

  ngOnDestroy() {
    this.refresh$.complete();
    this.destroy();
  }
}
