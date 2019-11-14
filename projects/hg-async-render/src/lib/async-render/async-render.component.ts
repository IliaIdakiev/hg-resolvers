import { Component, Input, OnDestroy, Inject, TemplateRef, Optional, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { HG_ASYNC_RENDER_RESOLVER, AsyncRenderResolver } from '../async-render-resolver';
import { AsyncRenderBase } from '../async-render-base';

@Component({
  selector: 'hg-async-render',
  templateUrl: './async-render.component.html',
  styleUrls: ['./async-render.component.scss'],
  exportAs: 'asyncRender'
})
export class AsyncRenderComponent extends AsyncRenderBase implements OnInit, OnDestroy {

  refresh$: Subject<void> = new Subject();
  @Input() loaderTemplateRef: TemplateRef<any>;
  @Input() errorTemplateRef: TemplateRef<any>;
  @Input() autoHideLoader = false;
  @Input() autoShowError = false;

  constructor(@Inject(HG_ASYNC_RENDER_RESOLVER) @Optional() resolvers: AsyncRenderResolver<any>[] = []) {
    super(resolvers);
    this.refresh$.subscribe(() => { this.resolve(); });
  }

  ngOnInit() {
    this.resolve();
  }

  ngOnDestroy() {
    this.refresh$.complete();
    this.destroy();
  }
}
