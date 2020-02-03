import { Resolver, ResolverConfig } from './resolver';
import { asapScheduler, Subject, from, asyncScheduler, combineLatest, Subscription } from 'rxjs';
import { scan, shareReplay, map } from 'rxjs/operators';
import { ResolverState, ResolveState } from './enums';

export class ResolveBase {

  refresh$: Subject<void> = new Subject();

  isFunctionObservableTargetDirectivesCount = 0;
  discardSkippedResolvers = true;

  state = ResolveState.PENDING;

  resolveOnInit = true;

  // tslint:disable-next-line:variable-name
  private stateChangesSubscription: Subscription;

  get isSettled() { return this.state === ResolveState.SETTLED; }

  get isResolving() { return this.state === ResolveState.RESOLVING; }

  get isPending() { return this.state === ResolveState.PENDING; }

  get isErrored() { return this.state === ResolveState.ERRORED; }

  // tslint:disable-next-line:variable-name
  private _resolvers: Resolver<any>[];
  // tslint:disable-next-line:variable-name
  private _subscribeRequested = false;

  public set resolvers(res: Resolver<any>[]) {
    this._resolvers = res;
    if (this._subscribeRequested) { return; }
    this._subscribeRequested = true;
    Promise.resolve().then(() => {
      this._subscribeRequested = false;
      this.subscribeToResolverStateChanges();
    });
  }

  public get resolvers() {
    return this._resolvers;
  }


  subscribeToResolverStateChanges() {
    if (this.stateChangesSubscription) { this.stateChangesSubscription.unsubscribe(); this.stateChangesSubscription = null; }
    this.stateChangesSubscription = combineLatest(
      this.resolvers.map(r => r.stateChanges$.pipe(map(state => ({ state, resolver: r })))),
    ).subscribe((data) => { this._calculateResolveState(data); });
  }

  private _calculateResolveState(data: { state: { previous: ResolverState; current: ResolverState; }; resolver: Resolver<any, any>; }[]) {
    let settledCount = 0;
    let allChecked = 0;
    for (const { state: { current }, resolver } of data) {
      if ((resolver as any)._isBeingDestroyed || resolver.shouldSkip) { continue; }
      if (current === ResolverState.RESOLVING) {
        this.state = ResolveState.RESOLVING;
        return;
      }

      if (current === ResolverState.SETTLED) { settledCount++; }
      allChecked++;
    }

    if (settledCount === allChecked) {
      this.state = ResolveState.SETTLED;
      return;
    }

    this.state = ResolveState.ERRORED;
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnInit() {
    if (this.resolveOnInit) { this.resolve(); }
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy() {
    this.refresh$.complete();
    this.destroy();
  }

  constructor(resolvers: Resolver<any>[] = []) {
    this.resolvers = [].concat(resolvers || []);
    this.resolvers.forEach(r => {
      r.setParentResolveContainer = this;
      if ((r as any).isFunctionObservableTarget) { this.isFunctionObservableTargetDirectivesCount++; }
    });
  }

  attachResolver(resolver: Resolver<any>) {
    resolver.setParentResolveContainer = this;
    this.resolvers = this.resolvers.concat(resolver);
    if ((resolver as any).isFunctionObservableTarget) { this.isFunctionObservableTargetDirectivesCount++; }
  }

  detachResolver(resolver: Resolver<any>) {
    this.resolvers = this.resolvers.filter(r => r !== resolver);

    if ((resolver as any).isFunctionObservableTarget) {
      this.isFunctionObservableTargetDirectivesCount--;
    }
  }

  protected destroy() {
    this.resolvers.forEach(res => res.destroy());
  }

  public resolve() {
    asapScheduler.schedule(() => {
      this.resolvers.forEach(res => {
        const isAutoConfig = [ResolverConfig.AutoResolve, ResolverConfig.AutoResolveOnce].includes(res.config);
        if (res.shouldSkip || isAutoConfig) { return; }
        (res as any)._resolve();
      });
    });
  }

  get _errors() {
    return this.resolvers.map(r => {
      return (r as any)._error;
    });
  }
}
