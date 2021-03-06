import { first, takeUntil, filter, withLatestFrom, observeOn } from 'rxjs/operators';
import { asapScheduler, Observable, combineLatest, of, Subscription, ReplaySubject, Subject, asyncScheduler, race } from 'rxjs';
import { diff, NOTHING } from './utils/differ';
import { ResolveComponent } from './resolve/resolve.component';
import { ResolveDirective } from './resolve.directive';
import { ResolveBase } from './resolve-base';
import { IResolverRecord } from './interfaces';
import { ResolverState } from './enums';
import { SimpleChanges } from '@angular/core';

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

const state = new WeakMap<ResolveBase, WeakMap<Resolver<any>, IResolverRecord>>();

export class Resolver<T, D = any> {
  disconnectDifferentInstances = false;

  public config = ResolverConfig.Default;

  public stateChanges$: ReplaySubject<{ previous: ResolverState | null; current: ResolverState; }> = new ReplaySubject(1);

  // tslint:disable-next-line:variable-name
  private _isAlive$: Subject<void> = new Subject();

  // tslint:disable-next-line:variable-name
  private _isPromoted$: Subject<void> = new Subject();

  // tslint:disable-next-line:variable-name
  private _isPromotedResolve = false;

  // tslint:disable-next-line:variable-name
  protected parentContainer: ResolveComponent | ResolveDirective = null;

  // tslint:disable-next-line:variable-name
  private _shouldSkip = null;

  // tslint:disable-next-line:variable-name
  private _autoResolveOnceCompleted = false;

  // tslint:disable-next-line:variable-name
  private _dependencySubscription: Subscription;

  // tslint:disable-next-line:variable-name
  // private _state = { loading: false, errored: false };

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

  // tslint:disable-next-line:variable-name
  private _isDelegated = false;

  // tslint:disable-next-line:variable-name
  private _isAttached = false;

  // tslint:disable-next-line:variable-name
  private _isBeingDestroyed = false;

  public resolveOnInit = true;

  public previousState = null;

  // tslint:disable-next-line:variable-name
  private _state: ResolverState;

  public set state(s: ResolverState) {
    this.previousState = this._state;
    this._state = s;
    this.stateChanges$.next({ previous: this.previousState, current: s });
  }

  public get state() {
    return this._state;
  }

  get isSettled() { return this.state === ResolverState.SETTLED; }

  get isResolving() { return this.state === ResolverState.RESOLVING; }

  get isPending() { return this.state === ResolverState.PENDING; }

  get isErrored() { return this.state === ResolverState.ERRORED; }

  get error(): Error {
    if (this._isBeingDestroyed) { return; }
    if (this.isFunctionObservableTarget) { return this._error; }
    // tslint:disable-next-line:max-line-length
    console.warn('hg-resolvers: Action based async render resolvers don\'t have error property! Data management should be outsourced!');
    return undefined;
  }

  get data(): T {
    if (this._isBeingDestroyed) { return; }
    if (this.isFunctionObservableTarget) { return this._data; }
    // tslint:disable-next-line:max-line-length
    console.warn('hg-resolvers: Action based async render resolvers don\'t have data property! Data management should be outsourced!');
    return undefined;
  }

  public get data$() {
    if (this._isBeingDestroyed) { return; }
    if (this.isFunctionObservableTarget) { return this._dataObservable$; }
    // tslint:disable-next-line:max-line-length
    console.warn('hg-resolvers: Action based async render resolvers don\'t have data$ property! Data management should be outsourced!');
    return undefined;
  }

  public get error$() {
    if (this._isBeingDestroyed) { return; }
    if (this.isFunctionObservableTarget) { return this._errorObservable$; }
    // tslint:disable-next-line:max-line-length
    console.warn('hg-resolvers: Action based async render resolvers don\'t have error$ property! Data management should be outsourced!');
    return undefined;
  }


  // tslint:disable-next-line:variable-name
  private __parentResolveContainer__ = null;

  set setParentResolveContainer(parentResolveContainer: ResolveBase) {
    if (!this.constructor) {
      // tslint:disable-next-line:max-line-length
      console.warn('hg-resolvers: Missing constructor property!');
      return;
    }

    if (!this.disconnectDifferentInstances) {
      let resolveContainerRecord: WeakMap<Resolver<any>, IResolverRecord> = state.get(parentResolveContainer) || new WeakMap();
      const currentPrototype = Object.getPrototypeOf(this);
      if (!resolveContainerRecord.has(currentPrototype)) {
        resolveContainerRecord = new WeakMap();
        resolveContainerRecord.set(currentPrototype, {
          ctor: this.constructor,
          requested: false,
          delegateInstance: this,
          delegateChannel: new ReplaySubject(1),
          resolveContainer: parentResolveContainer,
          resolved: false,
          __subscriberInstances: [],
          set subscriberInstances(val: Resolver<any, any>[]) {
            this.__subscriberInstances = val;
            if (val.length === 0) { this.noSubscriptions$.next(); this.noSubscriptions$.complete(); }
          },
          get subscriberInstances() {
            return this.__subscriberInstances;
          },
          noSubscriptions$: new Subject()
        });
        state.set(parentResolveContainer, resolveContainerRecord);
      }

    }

    this.__parentResolveContainer__ = parentResolveContainer;
  }

  set shouldSkip(value: boolean) {
    const target = this.targetFn as IActionsTarget<T>;
    if (value === true && !this._shouldSkip) {
      if (!!this._functionObservableSubscription) {
        // if we have isFunctionObservableTarget === true as we are in the state of resolving we will have _functionObservableSubscription
        this._functionObservableSubscription.unsubscribe();
        this._functionObservableSubscription = undefined;
      } else if (!!this._dependencySubscription) {
        // if we are in the state of autoResolve (waiting for the dependencies to change)
        this._dependencySubscription.unsubscribe();
        this._dependencySubscription = undefined;
      } else if (this.state === ResolverState.RESOLVING && target.cancelAction) {
        // if we have isFunctionObservableTarget === false as we are in the state of resolving
        target.cancelAction();
      }
      if (this.previousState !== null && ![ResolverState.SETTLED, ResolverState.ERRORED].includes(this.state)) {
        this.state = this.previousState;
      }
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
  ) {
    this.state = ResolverState.PENDING;
  }


  private delegate(delegate: ReplaySubject<any>) {
    delegate.pipe(
      observeOn(asyncScheduler),
      filter(e => e.type === 'deps'),
      withLatestFrom(this.getDeps()),
      takeUntil(race(this._isAlive$, this._isPromoted$))
    ).subscribe(([{ data: otherDeps }, currentDeps]) => {
      const dataDiff = diff(otherDeps, currentDeps);
      if (dataDiff !== NOTHING) {
        // tslint:disable-next-line:max-line-length
        console.warn(`hg-resolvers (${this.constructor.name}): Two different resolver dependency values received! You must set disconnectDifferentInstances to true if this was intentional!`);
      }
    });

    delegate.pipe(filter(e => e.type === 'loading'), takeUntil(race(this._isAlive$, this._isPromoted$))).subscribe(() => {
      this.state = ResolverState.RESOLVING;
    });

    delegate.pipe(filter(e => e.type === 'success'), takeUntil(race(this._isAlive$, this._isPromoted$))).subscribe(e => {
      this.state = ResolverState.SETTLED;

      if (this.isFunctionObservableTarget) {
        this._data = e.data;
        this._data$.next(e.data);
      }
    });

    delegate.pipe(filter(e => e.type === 'failure'), takeUntil(race(this._isAlive$, this._isPromoted$))).subscribe(e => {
      this.state = ResolverState.ERRORED;
      if (this.isFunctionObservableTarget) {
        this._error = e.data;
        this._error$.next(e.data);
      }
    });
  }

  private getResolveContainerResolverRecord() {
    if (this.disconnectDifferentInstances) { return null; }
    const containerRecords = state.get(this.__parentResolveContainer__);
    if (!containerRecords) { return null; }
    return containerRecords.get(Object.getPrototypeOf(this));
  }

  private getDeps() {
    const isAutoResolveOnceConfig = this.config === ResolverConfig.AutoResolveOnce;
    const isDefaultConfig = this.config === ResolverConfig.Default;

    let dependencies: any = this.dependencies;
    if (typeof this.dependencies === 'function') {
      dependencies = this.dependencies();
    }

    if (dependencies && !Array.isArray(dependencies)) { dependencies = [dependencies]; }

    return !dependencies ? of(undefined) : combineLatest(...dependencies).pipe(
      (isAutoResolveOnceConfig || isDefaultConfig) ? first() : takeUntil(this._isAlive$),
      filter(() => !this.shouldSkip)
    );
  }

  resolve() {
    if (this.shouldSkip) { return; }
    this._resolve();
  }

  private _resolve(auto = false) {

    const resolverIdRecordEntry = this.getResolveContainerResolverRecord();

    if (resolverIdRecordEntry) {
      if (auto === false && this._isDelegated) {
        resolverIdRecordEntry.delegateInstance._resolve(false);
      } else if (!this._isDelegated && resolverIdRecordEntry.delegateInstance !== this) {
        this._isDelegated = true;
        this.delegate(resolverIdRecordEntry.delegateChannel);
        resolverIdRecordEntry.subscriberInstances = resolverIdRecordEntry.subscriberInstances.concat(this);
      }
    }

    if (this._isDelegated) {
      asyncScheduler.schedule(() => {
        const delegateInstance = resolverIdRecordEntry.delegateInstance;
        if (delegateInstance.state === ResolverState.SETTLED) {
          resolverIdRecordEntry.delegateChannel.next({ type: 'success', data: delegateInstance._data });
        } else if (delegateInstance.state === ResolverState.ERRORED) {
          resolverIdRecordEntry.delegateChannel.next({ type: 'failure', data: delegateInstance._error });
        }
      });
      return;
    }


    if (!this._isPromotedResolve && resolverIdRecordEntry) {
      resolverIdRecordEntry.requested = true;
      resolverIdRecordEntry.resolved = false;
    }

    if (this._dependencySubscription) { this._dependencySubscription.unsubscribe(); }
    const isAutoResolveOnceConfig = this.config === ResolverConfig.AutoResolveOnce;

    if (isAutoResolveOnceConfig) { this._autoResolveOnceCompleted = true; }

    asapScheduler.schedule(() => {

      const deps = this.getDeps();

      this._dependencySubscription = deps.subscribe(data => {
        if (this._isPromotedResolve) { this._isPromotedResolve = false; return; }

        this.state = ResolverState.RESOLVING;

        if (resolverIdRecordEntry) {
          resolverIdRecordEntry.requested = false;
        }

        const resolverDelegate = resolverIdRecordEntry && resolverIdRecordEntry.delegateChannel;
        if (resolverDelegate) {
          resolverDelegate.next({ type: 'deps', data });
          resolverDelegate.next({ type: 'loading', data: null });
        }

        if (!this.isFunctionObservableTarget) {
          const target = this.targetFn as IActionsTarget<T>;
          target.loadAction(data);
          target.success$.pipe(first(), takeUntil(this._isAlive$)).subscribe(() => {

            this.state = ResolverState.SETTLED;

            if (resolverDelegate) {
              resolverDelegate.next({ type: 'success', data: null });
              resolverIdRecordEntry.resolved = true;
            }

            if (resolverIdRecordEntry) {
              resolverIdRecordEntry.requested = false;
            }
          });
          target.failure$.pipe(first(), takeUntil(this._isAlive$)).subscribe(() => {
            this.state = ResolverState.ERRORED;

            if (resolverDelegate) {
              resolverDelegate.next({ type: 'failure', data: null });
              resolverIdRecordEntry.resolved = true;
            }

            if (resolverIdRecordEntry) {
              resolverIdRecordEntry.requested = false;
            }
          });
        } else {
          const targetFn = this.targetFn as FunctionObservableTarget<T, D>;
          if (this._functionObservableSubscription) {
            this._functionObservableSubscription.unsubscribe();
            this._functionObservableSubscription = undefined;
          }

          // tslint:disable-next-line:max-line-length
          this._functionObservableSubscription = targetFn(data).pipe(takeUntil(this._isAlive$)).subscribe({
            next: res => {
              this._data = res;
              this._data$.next(res);

              this.state = ResolverState.SETTLED;

              if (resolverDelegate) {
                resolverDelegate.next({ type: 'success', data: res });
                resolverIdRecordEntry.resolved = true;
              }

              if (resolverIdRecordEntry) {
                resolverIdRecordEntry.requested = false;
              }
            },
            error: err => {
              this._error = err;
              this._error$.next(err);

              this.state = ResolverState.ERRORED;

              if (resolverDelegate) {
                resolverDelegate.next({ type: 'failure', data: err });
                resolverIdRecordEntry.resolved = true;
              }

              if (resolverIdRecordEntry) {
                resolverIdRecordEntry.requested = false;
              }
            },
            complete: () => {
              this._functionObservableSubscription = undefined;

              if (resolverDelegate) {
                resolverIdRecordEntry.resolved = true;
              }

              if (resolverIdRecordEntry) {
                resolverIdRecordEntry.requested = false;
              }
            }
          });
        }
      });
    });
  }

  promoteNextResolver() {
    const resolveContainerRecord = state.get(this.__parentResolveContainer__);
    if (!resolveContainerRecord) { return; }
    const prototype = Object.getPrototypeOf(this);
    const record = resolveContainerRecord.get(prototype);
    if (this._isBeingDestroyed) {
      if (record && record.subscriberInstances.length > 0) {
        asyncScheduler.schedule(() => { this.promoteNextResolver(); });
      } else if (record && record.delegateInstance) {
        resolveContainerRecord.delete(prototype);
      }
      return;
    }
    if (!record || record.subscriberInstances.length === 0) { return; }
    const resolver = record.subscriberInstances[0];
    if (!resolver) { return; }
    resolver.promote();
    record.subscriberInstances = record.subscriberInstances.slice(1);
  }

  promote() {
    this._isPromoted$.next();
    this._isPromotedResolve = true;
    this._isDelegated = false;

    const resolveContainerRecord = state.get(this.__parentResolveContainer__);
    if (resolveContainerRecord) {
      const prototype = Object.getPrototypeOf(this);
      const record = resolveContainerRecord.get(prototype);
      if (record) {
        record.delegateInstance = this;
        record.delegateChannel = new ReplaySubject(1);
      }
    }
    Promise.resolve().then(() => {
      if (this._isBeingDestroyed) { return; }
      this.resolve();
    });
  }

  killStreams() {
    this._isAlive$.next();
    this._isAlive$.complete();
  }

  destroy() {
    this.stateChanges$.complete();
    let waitUntilResolved = false;
    let isDelegate = false;
    this._isBeingDestroyed = true;
    let resolveStreamDestroy$ = null;
    if (!this.disconnectDifferentInstances) {
      const resolveContainerRecord = state.get(this.__parentResolveContainer__);
      const prototype = Object.getPrototypeOf(this);
      if (resolveContainerRecord && resolveContainerRecord.has(prototype)) {
        const record = resolveContainerRecord.get(prototype);
        if (record.delegateInstance === this) {
          isDelegate = true;
          if (this.state === ResolverState.RESOLVING) {
            waitUntilResolved = true;
            resolveStreamDestroy$ = record.noSubscriptions$;
          }
          if (record.subscriberInstances.length === 0) {
            Promise.resolve().then(() => { resolveContainerRecord.delete(prototype); });
          }
        } else {
          record.subscriberInstances = record.subscriberInstances.filter(i => i !== this);
        }
      }
    }

    if (this.data$ && waitUntilResolved) {
      this.data$.pipe(observeOn(asyncScheduler), first(), takeUntil(resolveStreamDestroy$)).subscribe({
        error: () => {
          if (isDelegate) { this.promoteNextResolver(); }
          this.killStreams();
        },
        complete: () => {
          if (isDelegate) { this.promoteNextResolver(); }
          this.killStreams();
        }
      });
    } else {
      if (isDelegate) { this.promoteNextResolver(); }
      this.killStreams();
    }

    if (this.state === ResolverState.RESOLVING) {
      const target = this.targetFn as IActionsTarget<T>;
      if (target.cancelAction) {
        target.cancelAction();
      }
    }
    this.state = ResolverState.COMPLETED;
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy() { this.destroy(); }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    asapScheduler.schedule(() => {
      if (
        // the case when the container will call the resolve on the individual resolvers
        (this.parentContainer && this.parentContainer.resolveOnInit && this.config === ResolverConfig.Default) ||
        // in this case the resolver is responsible for triggering the resolve (AutoResolve & AutoResolveOnce)
        (!this.parentContainer && (!this.resolveOnInit && this.config === ResolverConfig.Default))
      ) { return; }
      this._process();
    });
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnChanges(simpleChanges: SimpleChanges) {
    if (
      simpleChanges.shouldSkip &&
      simpleChanges.shouldSkip.currentValue === false &&
      simpleChanges.shouldSkip.previousValue === true &&
      !this._dependencySubscription
    ) {
      this._process();
    }
  }

  _process() {
    if (this._processing) { return; }
    this._processing = true;
    asapScheduler.schedule(() => {
      this._processing = false;
      if (this._shouldSkip === true) {
        if (this._dependencySubscription) { this._dependencySubscription.unsubscribe(); }
        return;
      }

      if (this.resolveOnInit && !this.parentContainer) { this.resolve(); return; }

      // resolve only if we haven't subscribed already
      const isAutoResolve = this.config === ResolverConfig.AutoResolve;
      if (isAutoResolve && !this._dependencySubscription) { this._resolve(true); return; }

      // resolve only if we haven't subscribed already
      const isAutoResolveOnce = this.config === ResolverConfig.AutoResolveOnce;
      if (isAutoResolveOnce && this._autoResolveOnceCompleted === false && !this._dependencySubscription) { this._resolve(true); }
    });
  }
}
