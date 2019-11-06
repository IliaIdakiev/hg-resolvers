import { first, takeUntil } from 'rxjs/operators';
import { asapScheduler, Subject, Observable, combineLatest, of, Subscription } from 'rxjs';
import { InjectionToken } from '@angular/core';

export const HG_ASYNC_RENDER = new InjectionToken('HG_ASYNC_RENDER');

export enum ResolverConfig {
  Default,
  AutoResolveOnce,
  AutoResolve
}

export class AsyncRenderResolver<T = any> {
  private isAlive$: Subject<void> = new Subject();
  // tslint:disable-next-line:variable-name
  private _shouldSkip = null;
  // tslint:disable-next-line:variable-name
  private _autoResolveOnceCompleted = false;
  // tslint:disable-next-line:variable-name
  private _dependencySubscription: Subscription;

  state = { loading: false, errored: false };
  resolveRequested = false;

  config = ResolverConfig.Default;

  set shouldSkip(value: boolean) {
    const shouldAutoResolveOnce = (this.config === ResolverConfig.AutoResolveOnce && this._autoResolveOnceCompleted === false);
    if (
      (
        (this.config === ResolverConfig.AutoResolve && this._shouldSkip === true) ||
        (shouldAutoResolveOnce && this._shouldSkip)
      ) && value === false
    ) {
      if (shouldAutoResolveOnce) { this._autoResolveOnceCompleted = true; }
      asapScheduler.schedule(() => { this.resolve(); });
    }
    if (value && this._dependencySubscription) {
      this._dependencySubscription.unsubscribe();
      this._dependencySubscription = null;
    }
    this._shouldSkip = value;
  }

  get shouldSkip() {
    return this._shouldSkip;
  }

  constructor(
    private loadAction: (data: T) => void,
    private cancelAction: () => void,
    private success$: Observable<any>,
    private failure$: Observable<any>,
    private dependencies: Observable<any> | Observable<any>[] = null
  ) {

  }

  resolve() {
    if (this.resolveRequested) { return; }
    this.resolveRequested = true;

    if (this._dependencySubscription) { this._dependencySubscription.unsubscribe(); }

    const deps = !this.dependencies ? of(undefined, asapScheduler) : combineLatest(this.dependencies, asapScheduler).pipe(
      this.config === ResolverConfig.AutoResolveOnce ? first() : takeUntil(this.isAlive$)
    );

    this.state.errored = false;
    this.state.loading = true;
    this.resolveRequested = false;

    this._dependencySubscription = deps.subscribe(data => {
      this.state.errored = false;
      this.state.loading = true;
      this.loadAction(data);
      this.success$.pipe(first(), takeUntil(this.isAlive$)).subscribe(() => {
        this.state.loading = false;
        this.state.errored = false;
      });
      this.failure$.pipe(first(), takeUntil(this.isAlive$)).subscribe(() => {
        this.state.loading = false;
        this.state.errored = true;
      });
    });
  }

  destroy() {
    this.isAlive$.next();
    this.isAlive$.complete();

    if (!this.state.loading) { return; }
    this.cancelAction();
  }
}
