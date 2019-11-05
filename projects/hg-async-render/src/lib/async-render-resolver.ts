import { first, takeUntil } from 'rxjs/operators';
import { asapScheduler, Subject, Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';

export const HG_ASYNC_RENDER = new InjectionToken('HG_ASYNC_RENDER');

export class AsyncRenderResolver {
  isAlive: Subject<void> = new Subject();
  state = { loading: false, errored: false };
  resolveRequested = false;
  shouldSkip = false;

  constructor(
    private loadAction: () => void,
    private cancelAction: () => void,
    private success$: Observable<any>,
    private failure$: Observable<any>
  ) { }

  resolve() {
    if (this.resolveRequested) { return; }
    this.resolveRequested = true;
    asapScheduler.schedule(() => {
      this.state.errored = false;
      this.state.loading = true;
      this.loadAction();
      this.resolveRequested = false;
      this.success$.pipe(first(), takeUntil(this.isAlive)).subscribe(() => {
        this.state.loading = false;
        this.state.errored = false;
      });
      this.failure$.pipe(first(), takeUntil(this.isAlive)).subscribe(() => {
        this.state.loading = false;
        this.state.errored = true;
      });
    });
  }

  destroy() {
    this.isAlive.next();
    this.isAlive.complete();

    if (!this.state.loading) { return; }
    this.cancelAction();
  }
}
