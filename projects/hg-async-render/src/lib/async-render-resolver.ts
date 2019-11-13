import { first, takeUntil } from 'rxjs/operators';
import { asapScheduler, Subject, Observable, combineLatest, of, Subscription, asyncScheduler } from 'rxjs';
import { InjectionToken } from '@angular/core';

export const HG_ASYNC_RENDER_RESOLVER = new InjectionToken<string>('HG_ASYNC_RENDER_RESOLVER');

export enum ResolverConfig {
  Default,
  AutoResolveOnce,
  AutoResolve
}

export class AsyncRenderResolver<T = any> {
  // tslint:disable-next-line:variable-name
  private _isAlive$: Subject<void> = new Subject();

  // tslint:disable-next-line:variable-name
  private _shouldSkip = null;

  // tslint:disable-next-line:variable-name
  private _autoResolveOnceCompleted = false;

  // tslint:disable-next-line:variable-name
  private _dependencySubscription: Subscription;

  // tslint:disable-next-line:variable-name
  private _resolveRequested = false;

  // tslint:disable-next-line:variable-name
  private _state = { loading: false, errored: false };

  get isLoading() { return this._state.loading; }

  get hasErrored() { return this._state.errored; }

  config = ResolverConfig.Default;

  set shouldSkip(value: boolean) {
    const shouldAutoResolveOnce = (this.config === ResolverConfig.AutoResolveOnce && this._autoResolveOnceCompleted === false);
    if (
      (
        (this.config === ResolverConfig.AutoResolve && this._shouldSkip === true) ||
        (shouldAutoResolveOnce && this._shouldSkip)
      ) && value === false
    ) {
      asapScheduler.schedule(() => { this.resolve(true); });
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

  resolve(auto = false) {
    if (this._resolveRequested || (auto && this._autoResolveOnceCompleted)) { return; }
    this._resolveRequested = true;

    if (this._dependencySubscription) { this._dependencySubscription.unsubscribe(); }
    const isAutoResolveOnceConfig = this.config === ResolverConfig.AutoResolveOnce;
    const isDefaultConfig = this.config === ResolverConfig.Default;

    if (isAutoResolveOnceConfig) { this._autoResolveOnceCompleted = true; }
    this._state.errored = false;
    this._state.loading = true;

    asapScheduler.schedule(() => {
      this._resolveRequested = false;

      const deps = !this.dependencies ? of(undefined) : combineLatest(this.dependencies).pipe(
        (isAutoResolveOnceConfig || isDefaultConfig) ? first() : takeUntil(this._isAlive$)
      );

      this._dependencySubscription = deps.subscribe(data => {
        this._state.errored = false;
        this._state.loading = true;
        this.loadAction(data);
        this.success$.pipe(first(), takeUntil(this._isAlive$)).subscribe(() => {
          this._state.loading = false;
          this._state.errored = false;
        });
        this.failure$.pipe(first(), takeUntil(this._isAlive$)).subscribe(() => {
          this._state.loading = false;
          this._state.errored = true;
        });
      });
    });
  }

  destroy() {
    this._isAlive$.next();
    this._isAlive$.complete();

    if (!this._state.loading) { return; }
    this.cancelAction();
  }
}
