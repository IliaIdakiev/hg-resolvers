import { first, takeUntil, filter } from 'rxjs/operators';
import { asapScheduler, Subject, Observable, combineLatest, of, Subscription, ReplaySubject } from 'rxjs';
import { InjectionToken } from '@angular/core';

export const HG_ASYNC_RENDER_RESOLVER = new InjectionToken<string>('HG_ASYNC_RENDER_RESOLVER');

export enum ResolverConfig {
  Default,
  AutoResolveOnce,
  AutoResolve
}

interface IActionsTarget<D> {
  loadAction: (deps: D) => void;
  cancelAction: () => void;
  success$: Observable<any>;
  failure$: Observable<any>;
}

type FunctionObservableTarget<T, D> = (deps: D) => Observable<T>;

export class AsyncRenderResolver<T, D = any> {

  private static resolverIdRecord: {
    [
    id: string]: { ctor: any, requested: boolean, delegate: Subject<{ type: 'success' | 'failure', data: any | Error }> }
  } = {};

  protected config = ResolverConfig.Default;

  // tslint:disable-next-line:variable-name
  private _isAlive$: Subject<void> = new Subject();

  // tslint:disable-next-line:variable-name
  private _shouldSkip = null;

  // tslint:disable-next-line:variable-name
  private _uniqueId = null;

  // tslint:disable-next-line:variable-name
  private _autoResolveOnceCompleted = false;

  // tslint:disable-next-line:variable-name
  private _dependencySubscription: Subscription;

  // tslint:disable-next-line:variable-name
  private _state = { loading: false, errored: false };

  // tslint:disable-next-line:variable-name
  private _data$ = new ReplaySubject<T>(1);
  // tslint:disable-next-line:variable-name
  private _data: T;

  // tslint:disable-next-line:variable-name
  private _error$ = new ReplaySubject<T>(1);
  // tslint:disable-next-line:variable-name
  private _error: Error = null;

  // tslint:disable-next-line:variable-name
  private _dataObservable$ = this._data$.asObservable();

  // tslint:disable-next-line:variable-name
  private _errorObservable$ = this._error$.asObservable();

  // tslint:disable-next-line:variable-name
  private _functionObservableSubscription: Subscription;

  get isLoading() { return this._state.loading; }

  get hasErrored() { return this._state.errored; }

  get error(): Error {
    if (this.isFunctionObservableTarget) { return this._error; }
    // tslint:disable-next-line:max-line-length
    console.warn('hg-async-render: Action based async render resolvers don\'t have error property! Data management should be outsourced!');
    return undefined;
  }

  get data(): T {
    if (this.isFunctionObservableTarget) { return this._data; }
    // tslint:disable-next-line:max-line-length
    console.warn('hg-async-render: Action based async render resolvers don\'t have data property! Data management should be outsourced!');
    return undefined;
  }

  public get data$() {
    if (this.isFunctionObservableTarget) { return this._dataObservable$; }
    // tslint:disable-next-line:max-line-length
    console.warn('hg-async-render: Action based async render resolvers don\'t have data$ property! Data management should be outsourced!');
    return undefined;
  }

  public get error$() {
    if (this.isFunctionObservableTarget) { return this._errorObservable$; }
    // tslint:disable-next-line:max-line-length
    console.warn('hg-async-render: Action based async render resolvers don\'t have error$ property! Data management should be outsourced!');
    return undefined;
  }

  protected set uid(value: any) {
    if (!this.constructor) {
      // tslint:disable-next-line:max-line-length
      console.warn('hg-async-render: Missing constructor property! Unique id loads are not possible without the constructor property!');
      return;
    }
    this._uniqueId = value;
    const existingRecord = AsyncRenderResolver.resolverIdRecord[value];
    if (existingRecord && existingRecord.ctor !== this.constructor) {
      // tslint:disable-next-line:max-line-length
      console.warn(`hg-async-render: Multiple uids for different types of resolvers! Please use same uids for same type of components! No unique loads for ${this.constructor.name}!`);
      return;
    }
    AsyncRenderResolver.resolverIdRecord[value] = { ctor: this.constructor, requested: false, delegate: new Subject() };
  }

  protected set autoUniqueId(value) {
    if (!value) { return; }
    this.uid = Symbol('Random Resolver Unique Id ');
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
      this.resolve(true);
    }
    this._shouldSkip = value;
  }

  get shouldSkip() {
    return this._shouldSkip;
  }

  private get isFunctionObservableTarget() {
    return this.targetFn instanceof Function;
  }

  constructor(
    private targetFn: IActionsTarget<T> | FunctionObservableTarget<T, D>,
    private dependencies: () => (Observable<any> | any[]) | Observable<any> | Observable<any>[] = null
  ) { }


  private delegate(delegate: Subject<any>) {
    delegate.pipe(filter(e => e.type === 'success'), takeUntil(this._isAlive$)).subscribe(e => {
      this._state.loading = false;
      this._state.errored = false;
      if (this.isFunctionObservableTarget) {
        this._data = e.data;
        this._data$.next(e.data);
      }
    });

    delegate.pipe(filter(e => e.type === 'failure'), takeUntil(this._isAlive$)).subscribe(e => {
      this._state.loading = false;
      this._state.errored = true;
      if (this.isFunctionObservableTarget) {
        this._error = e.data;
        this._error$.next(e.data);
      }
    });
  }

  resolve(auto = false) {
    const uniqueId = this._uniqueId;
    const resolverIdRecordEntry = AsyncRenderResolver.resolverIdRecord[uniqueId] || { requested: false, delegate: null };
    if (
      resolverIdRecordEntry.requested ||
      (auto && this._autoResolveOnceCompleted)
    ) {
      if (resolverIdRecordEntry) { this.delegate(resolverIdRecordEntry.delegate); }
      return;
    }

    if (uniqueId) { AsyncRenderResolver.resolverIdRecord[uniqueId].requested = true; }

    if (this._dependencySubscription) { this._dependencySubscription.unsubscribe(); }
    const isAutoResolveOnceConfig = this.config === ResolverConfig.AutoResolveOnce;
    const isDefaultConfig = this.config === ResolverConfig.Default;

    if (isAutoResolveOnceConfig) { this._autoResolveOnceCompleted = true; }

    asapScheduler.schedule(() => {
      this._state.errored = false;
      this._state.loading = true;
      this._error = undefined;

      let dependencies: any = this.dependencies;
      if (typeof this.dependencies === 'function') {
        dependencies = this.dependencies();
        if (Array.isArray(dependencies)) { dependencies = [dependencies]; }
      }
      const deps = !dependencies ? of(undefined) : combineLatest(dependencies).pipe(
        (isAutoResolveOnceConfig || isDefaultConfig) ? first() : takeUntil(this._isAlive$)
      );

      this._dependencySubscription = deps.subscribe(data => {

        const resolverDelegate = resolverIdRecordEntry.delegate;
        if (uniqueId && resolverIdRecordEntry && this.config !== ResolverConfig.AutoResolve) {
          resolverIdRecordEntry.requested = false;
        }

        asapScheduler.schedule(() => {
          this._state.errored = false;
          this._state.loading = true;
        });

        if (!this.isFunctionObservableTarget) {
          const target = this.targetFn as IActionsTarget<T>;
          target.loadAction(data);
          target.success$.pipe(first(), takeUntil(this._isAlive$)).subscribe(() => {
            this._state.loading = false;
            this._state.errored = false;
            if (resolverDelegate) { resolverDelegate.next({ type: 'success', data: null }); }
          });
          target.failure$.pipe(first(), takeUntil(this._isAlive$)).subscribe(() => {
            this._state.loading = false;
            this._state.errored = true;
            if (resolverDelegate) { resolverDelegate.next({ type: 'failure', data: null }); }
          });
        } else {
          const targetFn = this.targetFn as FunctionObservableTarget<T, D>;
          if (this._functionObservableSubscription) {
            this._functionObservableSubscription.unsubscribe();
            this._functionObservableSubscription = undefined;
          }
          this._functionObservableSubscription = targetFn(data).pipe(takeUntil(this._isAlive$)).subscribe({
            next: res => {
              this._data = res;
              this._data$.next(res);
              if (resolverDelegate) { resolverDelegate.next({ type: 'success', data: res }); }
              this._state.loading = false;
              this._state.errored = false;
            },
            error: err => {
              this._error = err;
              this._error$.next(err);
              if (resolverDelegate) { resolverDelegate.next({ type: 'failure', data: err }); }
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

    if (this._uniqueId) {
      const { [this._uniqueId]: deletedEntry, ...others } = AsyncRenderResolver.resolverIdRecord;
      if (deletedEntry) { deletedEntry.delegate.complete(); }
      AsyncRenderResolver.resolverIdRecord = others;
    }

    if (!this._state.loading) { return; }
    const target = this.targetFn as IActionsTarget<T>;
    if (target.cancelAction) {
      target.cancelAction();
    }
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy() {
    this.destroy();
  }
}
