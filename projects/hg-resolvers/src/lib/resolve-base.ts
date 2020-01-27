import { Resolver, ResolverConfig } from './resolver';
import { asapScheduler, Subject } from 'rxjs';

export class ResolveBase {

  refresh$: Subject<void> = new Subject();

  isFunctionObservableTargetDirectivesCount = 0;
  discardSkippedResolvers = true;

  resolveOnInit = true;
  isResolved = false;
  isResolvedSuccessfully = false;
  isLoading = false;
  isErrored = false;
  // tslint:disable-next-line:variable-name
  private _autoTriggeredCD = false;

  // tslint:disable-next-line:use-lifecycle-interface
  ngDoCheck() {
    if (this._autoTriggeredCD) { return; }
    // TODO: probably there is a way to optimize this so its not calculated on every cd run
    const { isResolvedSuccessfully, isResolved, isErrored, isLoading } = this.calculateState();
    if (
      isResolved !== this.isResolved ||
      isResolvedSuccessfully !== this.isResolvedSuccessfully ||
      isErrored !== this.isErrored ||
      isLoading !== this.isLoading
    ) {
      this._autoTriggeredCD = true;
      asapScheduler.schedule(() => {
        this.isResolved = isResolved;
        this.isResolvedSuccessfully = isResolvedSuccessfully;
        this.isErrored = isErrored;
        this.isLoading = isLoading;

        this._autoTriggeredCD = false;
      });
    }
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

  constructor(protected resolvers: Resolver<any>[] = []) {
    this.resolvers = [].concat(this.resolvers || []);
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

  calculateState() {
    return this.resolvers.reduce((acc, res) => {
      const isResolved = acc.isResolved &&
        (this.discardSkippedResolvers ? (res.shouldSkip ? true : res.isResolved) : res.isResolved);

      const isResolvedSuccessfully = acc.isResolvedSuccessfully &&
        (this.discardSkippedResolvers ? (res.shouldSkip ? true : res.isResolvedSuccessfully) : res.isResolvedSuccessfully);

      const isLoading = acc.isLoading ||
        (this.discardSkippedResolvers ? (res.shouldSkip ? false : res.isLoading) : res.isLoading);

      const isErrored = acc.isErrored ||
        (this.discardSkippedResolvers ? (res.shouldSkip ? false : res.isErrored) : res.isErrored);

      return { isResolved, isResolvedSuccessfully, isLoading, isErrored };
    }, {
      isResolved: true,
      isResolvedSuccessfully: true,
      isLoading: false,
      isErrored: false
    });
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
