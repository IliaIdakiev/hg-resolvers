import { Component, Input, OnDestroy, Inject, TemplateRef, Optional } from '@angular/core';
import { Subject } from 'rxjs';
import { HG_ASYNC_RENDER, AsyncRenderResolver } from '../async-render-resolver';
import { AsyncRenderBase } from '../async-render-base';

@Component({
  selector: 'hg-async-render',
  templateUrl: './async-render.component.html',
  styleUrls: ['./async-render.component.scss'],
  exportAs: 'asyncRender'
})
export class AsyncRenderComponent extends AsyncRenderBase implements OnDestroy {

  refresh$: Subject<void> = new Subject();
  @Input() loaderTemplateRef: TemplateRef<any>;

  constructor(@Inject(HG_ASYNC_RENDER) @Optional() resolvers: AsyncRenderResolver[] = []) {
    super(resolvers);
    this.resolve();
    this.refresh$.subscribe(() => { this.resolve(); });
  }

  ngOnDestroy() {
    this.refresh$.complete();
    this.destroy();
  }
}
