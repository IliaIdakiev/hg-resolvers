import { first, takeUntil, filter, withLatestFrom, observeOn } from 'rxjs/operators';
import { asapScheduler, Observable, combineLatest, of, Subscription, ReplaySubject, Subject, asyncScheduler } from 'rxjs';
import { diff, NOTHING } from './utils/differ';
import { ResolveComponent } from './resolve/resolve.component';
import { ResolveDirective } from './resolve.directive';

export enum ResolverConfig {
  Default = 'Default',
  AutoResolveOnce = 'AutoResolveOnce',
  AutoResolve = 'AutoResolve'
}

interface IActionsTarget<D> {
  loadAction: (deps: D) => void;
  cancelAction: () => void;
  success$: Observable<any>;
  failure$: Observable<any>;
}

type FunctionObservableTarget<T, D> = (deps: D) => Observable<T>;

export class Resolver<T, D = any> {

  private static resolverIdRecord: {
    [renderId: string]: {
      [resolverId: string]: {
        asyncRenderId: any,
        ctor: any,
        requested: boolean,
        resolved: boolean,
        delegate: ReplaySubject<{
          type: 'deps' | 'success' | 'failure', data: any | Error
        }>
      }
    }
  } = {};

  public config = ResolverConfig.Default;

  // tslint:disable-next-line:variable-name
  private _isAlive$: Subject<void> = new Subject();

  // tslint:disable-next-line:variable-name
  protected parentContainer: ResolveComponent | ResolveDirective = null;

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
  private _data: T = null;

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

  // tslint:disable-next-line:variable-name
  private _processing = false;

  public readonly isResolved = false;
  public readonly isResolvedSuccessfully = false;

  get isLoading() { return this._state.loading; }

  get isPending() { return this._state.loading === false && this._state.errored === false; }

  get isErrored() { return this._state.errored; }

  get error(): Error {
    if (this.isFunctionObservableTarget) { return this._error; }
    // tslint:disable-next-line:max-line-length
    console.warn('hg-resolvers: Action based async render resolvers don\'t have error property! Data management should be outsourced!');
    return undefined;
  }

  get data(): T {
    if (this.isFunctionObservableTarget) { return this._data; }
    // tslint:disable-next-line:max-line-length
    console.warn('hg-resolvers: Action based async render resolvers don\'t have data property! Data management should be outsourced!');
    return undefined;
  }

  public get data$() {
    if (this.isFunctionObservableTarget) { return this._dataObservable$; }
    // tslint:disable-next-line:max-line-length
    console.warn('hg-resolvers: Action based async render resolvers don\'t have data$ property! Data management should be outsourced!');
    return undefined;
  }

  public get error$() {
    if (this.isFunctionObservableTarget) { return this._errorObservable$; }
    // tslint:disable-next-line:max-line-length
    console.warn('hg-resolvers: Action based async render resolvers don\'t have error$ property! Data management should be outsourced!');
    return undefined;
  }

  protected set uid(value: any) { this._uniqueId = value; }

  // tslint:disable-next-line:variable-name
  private __parentRenderId__ = null;

  set __parentRenderId(value: any) {
    if (!this.constructor) {
      // tslint:disable-next-line:max-line-length
      console.warn('hg-resolvers: Missing constructor property! Unique id loads are not possible without the constructor property!');
      return;
    }

    if (this._uniqueId) {
      const existingRenderRecord = Resolver.resolverIdRecord[value];
      const existingResolverRecord = existingRenderRecord && existingRenderRecord[this._uniqueId] || null;

      if (existingResolverRecord && existingResolverRecord.ctor !== this.constructor) {
        // tslint:disable-next-line:max-line-length
        console.warn(`hg-resolvers: Multiple uids for different types of resolvers! Please use same uids for same type of components! No unique loads for ${this.constructor.name}!`);
        return;
      }

      if (!Resolver.resolverIdRecord[value]) { Resolver.resolverIdRecord[value] = {}; }
      if (!existingRenderRecord) {
        Resolver.resolverIdRecord[value][this._uniqueId] = {
          ctor: this.constructor,
          requested: false,
          delegate: new ReplaySubject(1),
          asyncRenderId: value,
          resolved: false
        };
      }

    }

    this.__parentRenderId__ = value;
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


  private delegate(delegate: ReplaySubject<any>) {

    delegate.pipe(
      observeOn(asyncScheduler),
      filter(e => e.type === 'deps'),
      withLatestFrom(this.getDeps()),
      takeUntil(this._isAlive$)
    ).subscribe(([{ data: otherDeps }, currentDeps]) => {
      const dataDiff = diff(otherDeps, currentDeps);
      if (dataDiff !== NOTHING) {
        // tslint:disable-next-line:max-line-length
        console.warn(`hg-resolvers (${this.constructor.name}): Two different resolver dependency values received! You must remove the autoUniqueId or the matching uids that you\'ve provided!`);
      }
    });

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

  private getResolverEntry() {
    if (!this._uniqueId || !this.__parentRenderId__) { return null; }
    return Resolver.resolverIdRecord[this.__parentRenderId__][this._uniqueId];

  }

  private getDeps() {
    const isAutoResolveOnceConfig = this.config === ResolverConfig.AutoResolveOnce;
    const isDefaultConfig = this.config === ResolverConfig.Default;

    let dependencies: any = this.dependencies;
    if (typeof this.dependencies === 'function') {
      dependencies = this.dependencies();
      if (Array.isArray(dependencies)) { dependencies = [dependencies]; }
    }
    return !dependencies ? of(undefined) : combineLatest(dependencies).pipe(
      (isAutoResolveOnceConfig || isDefaultConfig) ? first() : takeUntil(this._isAlive$)
    );
  }

  resolve(auto = false) {
    const uniqueId = this._uniqueId;
    const resolverIdRecordEntry = this.getResolverEntry();

    if (
      resolverIdRecordEntry && (resolverIdRecordEntry.requested || resolverIdRecordEntry.resolved) ||
      (auto && this._autoResolveOnceCompleted)
    ) {
      if (resolverIdRecordEntry) {
        this.delegate(resolverIdRecordEntry.delegate);
      }
      return;
    }

    if (resolverIdRecordEntry) {
      resolverIdRecordEntry.requested = true;
      resolverIdRecordEntry.resolved = false;
    }
    (this as any).isResolved = false;
    (this as any).isResolvedSuccessfully = false;

    if (this._dependencySubscription) { this._dependencySubscription.unsubscribe(); }
    const isAutoResolveOnceConfig = this.config === ResolverConfig.AutoResolveOnce;

    if (isAutoResolveOnceConfig) { this._autoResolveOnceCompleted = true; }

    asapScheduler.schedule(() => {
      this._state.errored = false;
      this._state.loading = true;
      this._error = undefined;

      const deps = this.getDeps();

      this._dependencySubscription = deps.subscribe(data => {

        const resolverDelegate = resolverIdRecordEntry && resolverIdRecordEntry.delegate;
        if (resolverDelegate) { resolverDelegate.next({ type: 'deps', data }); }
        if (uniqueId && resolverIdRecordEntry && this.config !== ResolverConfig.AutoResolve) {
          resolverIdRecordEntry.requested = false;
        }

        if (!this.isFunctionObservableTarget) {
          const target = this.targetFn as IActionsTarget<T>;
          target.loadAction(data);
          target.success$.pipe(first(), takeUntil(this._isAlive$)).subscribe(() => {
            this._state.loading = false;
            this._state.errored = false;

            (this as any).isResolved = true;
            (this as any).isResolvedSuccessfully = true;
            if (resolverDelegate) {
              resolverDelegate.next({ type: 'success', data: null });
              resolverIdRecordEntry.resolved = true;
            }
          });
          target.failure$.pipe(first(), takeUntil(this._isAlive$)).subscribe(() => {
            this._state.loading = false;
            this._state.errored = true;

            (this as any).isResolved = true;
            (this as any).isResolvedSuccessfully = false;
            if (resolverDelegate) {
              resolverDelegate.next({ type: 'failure', data: null });
              resolverIdRecordEntry.resolved = true;
            }
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
              (this as any).isResolved = true;
              (this as any).isResolvedSuccessfully = true;
              if (resolverDelegate) {
                resolverDelegate.next({ type: 'success', data: res });
                resolverIdRecordEntry.resolved = true;
              }
              this._state.loading = false;
              this._state.errored = false;
            },
            error: err => {
              this._error = err;
              this._error$.next(err);
              (this as any).isResolved = true;
              (this as any).isResolvedSuccessfully = false;
              if (resolverDelegate) {
                resolverDelegate.next({ type: 'failure', data: err });
                resolverIdRecordEntry.resolved = true;
              }
              this._state.loading = false;
              this._state.errored = true;
            },
            complete: () => {
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
      const { [this.__parentRenderId__]: { [this._uniqueId]: deletedEntry, ...inner }, ...outer } = Resolver.resolverIdRecord;
      if (deletedEntry) { deletedEntry.delegate.complete(); }
      Resolver.resolverIdRecord[this.__parentRenderId__] = { ...outer, [this.__parentRenderId__]: inner };
    }

    if (!this._state.loading) { return; }
    const target = this.targetFn as IActionsTarget<T>;
    if (target.cancelAction) {
      target.cancelAction();
    }
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy() { this.destroy(); }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    asapScheduler.schedule(() => {
      if (this.parentContainer) {
        if (!(this.parentContainer.resolveOnInit &&
          (this.config === ResolverConfig.AutoResolve || this.config === ResolverConfig.AutoResolveOnce))
        ) { return; }
      }
      this._process();
    });
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnChanges() { this._process(); }

  _process() {
    if (this._processing) { return; }
    this._processing = true;
    asapScheduler.schedule(() => {
      this._processing = false;
      if (this._shouldSkip === true) { return; }

      const isAutoResolve = this.config === ResolverConfig.AutoResolve;
      if (isAutoResolve) { this.resolve(true); return; }

      const isAutoResolveOnce = this.config === ResolverConfig.AutoResolveOnce;
      if (isAutoResolveOnce && this._autoResolveOnceCompleted === false) { this.resolve(true); }
    });
  }
}
