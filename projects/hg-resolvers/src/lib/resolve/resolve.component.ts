import { Component, Input, Inject, TemplateRef, Optional } from '@angular/core';
import { Subject } from 'rxjs';
import { Resolver } from '../resolver';
import { ResolveBase } from '../resolve-base';
import { HG_RESOLVERS } from '../injection-tokens';

@Component({
  selector: 'hg-resolve',
  templateUrl: './resolve.component.html',
  styleUrls: ['./resolve.component.scss'],
  exportAs: 'hgResolve'
})
export class ResolveComponent extends ResolveBase {

  refresh$: Subject<void>;

  @Input() resolveOnInit = false;

  @Input() loaderTemplateRef: TemplateRef<any>;
  @Input() errorTemplateRef: TemplateRef<any>;
  @Input() autoControlLoader = false;
  @Input() autoControlError = false;
  @Input() hideContentUntilResolvedSuccessfully = true;
  @Input() discardSkippedResolvers = true;

  constructor(@Inject(HG_RESOLVERS) @Optional() resolvers: Resolver<any>[] = []) {
    super(resolvers);
    (resolvers || []).forEach(r => (r as any).parentContainer = this);
    this.refresh$.subscribe(() => { this.resolve(); });
  }

}
