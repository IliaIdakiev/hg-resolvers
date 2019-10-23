import { Component, Input, OnDestroy, Inject, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
import { HG_ASYNC_RENDER, AsyncRenderResolver } from '../async-render-resolver';

@Component({
  selector: 'hg-async-render',
  templateUrl: './async-render.component.html',
  styleUrls: ['./async-render.component.scss'],
  exportAs: 'asyncRender'
})
export class AsyncRenderComponent implements OnDestroy {

  refresh$: Subject<void> = new Subject();
  @Input() loaderTemplateRef: TemplateRef<any>;

  constructor(@Inject(HG_ASYNC_RENDER) private resolvers: AsyncRenderResolver[]) {
    this.resolvers.forEach(res => res.resolve());
    this.refresh$.subscribe(() => { this.resolvers.forEach(res => res.resolve()); });
  }

  get isLoading() {
    return this.resolvers.reduce((acc, res) => acc || res.state.loading, false);
  }

  get hasError() {
    return this.resolvers.reduce((acc, res) => acc || res.state.errored, false);
  }

  ngOnDestroy() {
    this.refresh$.complete();
    this.resolvers.forEach(res => res.destroy());
  }
}
