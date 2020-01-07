import { Resolver, ResolverConfig } from './resolver';
import { asapScheduler } from 'rxjs';

const ids = [];

export class ResolverBase {

  uniqueId: symbol;
  isFunctionObservableTargetDirectivesCount = 0;
  discardSkippedResolvers = true;

  constructor(protected resolvers: Resolver<any>[] = []) {
    this.uniqueId = Symbol('Unique Async Render');
    ids.push(this.uniqueId);
    this.resolvers = [].concat(this.resolvers || []);
    this.resolvers.forEach(r => {
      r.__parentRenderId = this.uniqueId;
      if ((r as any).isFunctionObservableTarget) { this.isFunctionObservableTargetDirectivesCount++; }
    });
  }

  attachResolver(resolver: Resolver<any>) {
    resolver.__parentRenderId = this.uniqueId;
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
      acc.isErrored = acc.isErrored &&
        (this.discardSkippedResolvers ? (res.shouldSkip || res.isResolved) : res.isResolved);

      acc.isResolvedSuccessfully = acc.isResolvedSuccessfully &&
        (this.discardSkippedResolvers ? (res.shouldSkip || res.isResolvedSuccessfully) : res.isResolvedSuccessfully);

      acc.isLoading = acc.isLoading &&
        (this.discardSkippedResolvers ? (res.shouldSkip || res.isLoading) : res.isLoading);

      acc.isErrored = acc.isErrored &&
        (this.discardSkippedResolvers ? (res.shouldSkip || res.isErrored) : res.isErrored);

      return acc;
    }, {
      isResolved: true,
      isResolvedSuccessfully: true,
      isLoading: true,
      isErrored: true
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
