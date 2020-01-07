import { Resolver, ResolverConfig } from './resolver';
import { asapScheduler } from 'rxjs';

const ids = [];

export class AsyncRenderBase {

  uniqueId: symbol;
  isFunctionObservableTargetDirectivesCount = 0;
  discardSkippedResolvers;

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
    if ((resolver as any).isFunctionObservableTarget) {
      this.isFunctionObservableTargetDirectivesCount++;
    }

    asapScheduler.schedule(() => {
      if (!resolver.isResolved && !resolver.shouldSkip) {
        resolver.resolve();
      }
    });
  }

  detachResolver(resolver: Resolver<any>) {
    this.resolvers = this.resolvers.filter(r => r !== resolver);

    if ((resolver as any).isFunctionObservableTarget) {
      this.isFunctionObservableTargetDirectivesCount--;
    }
  }

  get isResolved() {
    return this.resolvers.reduce((acc, res) =>
      acc && this.discardSkippedResolvers ? res.shouldSkip || res.isResolved : res.isResolved, true
    );
  }

  get isResolvedSuccessfully() {
    return this.resolvers.reduce((acc, res) =>
      acc && this.discardSkippedResolvers ? res.shouldSkip || res.isResolvedSuccessfully : res.isResolvedSuccessfully, true
    );
  }

  get isLoading() {
    return this.resolvers.reduce((acc, res) =>
      acc && this.discardSkippedResolvers ? res.shouldSkip || res.isLoading : res.isLoading, true
    );
  }

  get isErrored() {
    return this.resolvers.reduce((acc, res) => acc && res.isErrored, true);
  }

  protected destroy() {
    this.resolvers.forEach(res => res.destroy());
  }

  public resolve() {
    asapScheduler.schedule(() => {
      this.resolvers.forEach(res => {
        const isAutoConfig = [ResolverConfig.AutoResolve, ResolverConfig.AutoResolveOnce].includes(res.config);
        if (res.shouldSkip || isAutoConfig) { return; }
        res.resolve();
      });
    });
  }

  get _errors() {
    return this.resolvers.map(r => {
      return (r as any)._error;
    });
  }
}
