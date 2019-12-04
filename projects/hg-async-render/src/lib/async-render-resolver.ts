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
  private _dataObservable$ = this._data$.asObservable();

  // tslint:disable-next-line:variable-name
  private _functionObservableSubscription: Subscription;

  get isLoading() { return this._state.loading; }

  get hasErrored() { return this._state.errored; }

  error: Error;

  get data$() {
    if (this.isFunctionObservableTarget) { return this._dataObservable$; }
    // tslint:disable-next-line:max-line-length
    console.warn('hg-async-render: Action based async render resolvers don\'t have data$ property! Data management should be controlled via action handlers!');
    return undefined;
  }

  set shouldSkip(value: boolean) {
    if (value === true && !this._shouldSkip) {
      if (!!this._functionObservableSubscription) {
        this._functionObservableSubscription.unsubscribe();
        this._functionObservableSubscription = undefined;
      } else if (!!this._dependencySubscription) {
        this._dependencySubscription.unsubscribe();
        this._dependencySubscription = undefined;
      }
      this._resolveRequested = false;
      this._state.errored = false;
      this._state.loading = false;
    }

    const shouldAutoResolveOnce = (this.config === ResolverConfig.AutoResolveOnce && this._autoResolveOnceCompleted === false);
    if (
      (
        (this.config === ResolverConfig.AutoResolve && this._shouldSkip === true) ||
        (shouldAutoResolveOnce && this._shouldSkip)
      ) && value === false
    ) {
      // asapScheduler.schedule(() => { this.resolve(true); });
      this.resolve(true);
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
    private dependencies: () => (Observable<any> | any[]) | Observable<any> | Observable<any>[] = null
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
    this.error = undefined;

    asapScheduler.schedule(() => {
      let dependencies: any = this.dependencies;
      if (typeof this.dependencies === 'function') {
        dependencies = this.dependencies();
        if (Array.isArray(dependencies)) { dependencies = [dependencies]; }
      }
      const deps = !dependencies ? of(undefined) : combineLatest(dependencies).pipe(
        (isAutoResolveOnceConfig || isDefaultConfig) ? first() : takeUntil(this._isAlive$)
      );

      this._dependencySubscription = deps.subscribe(data => {
        this._resolveRequested = false;
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
          if (this._functionObservableSubscription) {
            this._functionObservableSubscription.unsubscribe();
            this._functionObservableSubscription = undefined;
          }
          this._functionObservableSubscription = targetFn(data).pipe(takeUntil(this._isAlive$)).subscribe({
            next: res => {
              this._data$.next(res);
              this._state.loading = false;
              this._state.errored = false;
            },
            error: err => {
              this._data$.error(err);
              this.error = err;
              this._state.loading = false;
              this._state.errored = true;
            },
            complete: () => {
              this._state.loading = false;
              this._state.errored = false;
              this._functionObservableSubscription = undefined;
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
