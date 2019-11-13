import { first, takeUntil } from 'rxjs/operators';
import { asapScheduler, Subject, Observable, combineLatest, of, Subscription, ReplaySubject } from 'rxjs';
import { InjectionToken } from '@angular/core';

export const HG_ASYNC_RENDER_RESOLVER = new InjectionToken<string>('HG_ASYNC_RENDER_RESOLVER');

export enum ResolverConfig {
  Default,
  AutoResolveOnce,
  AutoResolve
}

interface IActionsTarget<T> {
  loadAction: (data: T) => void;
  cancelAction: () => void;
  success$: Observable<any>;
  failure$: Observable<any>;
}

type FunctionObservableTarget<T, R> = (data: T) => Observable<R>;

export class AsyncRenderResolver<T = any, R = any> {

  config = ResolverConfig.Default;

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

  // tslint:disable-next-line:variable-name
  private _data$ = new ReplaySubject<R>(1);

  // tslint:disable-next-line:variable-name
  private _functionObserverSubscription: Subscription;

  get isLoading() { return this._state.loading; }

  get hasErrored() { return this._state.errored; }

  get data$() {
    if (this.isFunctionObservableTarget) { return this._data$.asObservable(); }
    // tslint:disable-next-line:max-line-length
    console.warn('hg-async-render: Action based async render resolvers don\'t have data$ property! Data management should be controlled via action handlers!');
    return undefined;
  }

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

  get isFunctionObservableTarget() {
    return this.target instanceof Function;
  }

  constructor(
    private target: IActionsTarget<T> | FunctionObservableTarget<T, R>,
    private dependencies: Observable<any> | Observable<any>[] = null
  ) { }

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
        if (!this.isFunctionObservableTarget) {
          const target = this.target as IActionsTarget<T>;
          target.loadAction(data);
          target.success$.pipe(first(), takeUntil(this._isAlive$)).subscribe(() => {
            this._state.loading = false;
            this._state.errored = false;
          });
          target.failure$.pipe(first(), takeUntil(this._isAlive$)).subscribe(() => {
            this._state.loading = false;
            this._state.errored = true;
          });
        } else {
          const targetFn = this.target as FunctionObservableTarget<T, R>;
          if (this._functionObserverSubscription) {
            this._functionObserverSubscription.unsubscribe();
            this._functionObserverSubscription = undefined;
          }
          this._functionObserverSubscription = targetFn(data).pipe(takeUntil(this._isAlive$)).subscribe({
            next: res => {
              this._data$.next(res);
              this._state.loading = false;
              this._state.errored = false;
            },
            error: err => {
              this._data$.error(err);
              this._state.loading = false;
              this._state.errored = true;
            },
            complete: () => {
              this._data$.complete();
              this._state.loading = false;
              this._state.errored = false;
              this._functionObserverSubscription = undefined;
            }
          });
        }
      });
    });
  }

  destroy() {
    this._isAlive$.next();
    this._isAlive$.complete();

    if (!this._state.loading) { return; }
    const target = this.target as IActionsTarget<T>;
    if (target.cancelAction) {
      target.cancelAction();
    }
  }
}
