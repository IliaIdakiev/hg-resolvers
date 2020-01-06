import { Resolver, ResolverConfig } from './resolver';

const ids = [];

export class AsyncRenderBase {

  uniqueId: symbol;
  isFunctionObservableTargetDirectivesCount = 0;

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

    Promise.resolve().then(() => {
      if (!resolver.resolved && !resolver.shouldSkip) {
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

  get isLoading() {
    return this.resolvers.reduce((acc, res) => acc || res.isLoading, false);
  }

  get hasError() {
    return this.resolvers.reduce((acc, res) => acc || res.hasErrored, false);
  }

  protected destroy() {
    this.resolvers.forEach(res => res.destroy());
  }

  public resolve() {
    Promise.resolve().then(() => {
      this.resolvers.forEach(res => {
        const isAutoConfig = [ResolverConfig.AutoResolve, ResolverConfig.AutoResolveOnce].includes(res.config);
        if (res.shouldSkip || isAutoConfig) {
          if (isAutoConfig) {
            // tslint:disable-next-line:max-line-length
            console.warn(`hg-resolvers: resolveOnInit container and ${res.config} @ ${Object.getPrototypeOf(res).constructor.name} found! Skipping container resolveOnInit!`);
          }
          return;
        }
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
