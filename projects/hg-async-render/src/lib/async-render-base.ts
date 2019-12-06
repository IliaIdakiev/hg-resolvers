import { AsyncRenderResolver } from '../lib/async-render-resolver';

export class AsyncRenderBase {

  constructor(protected resolvers: AsyncRenderResolver<any>[] = []) {
    this.resolvers = [].concat(this.resolvers || []);
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
    this.resolvers.forEach(res => {
      if (res.shouldSkip) { return; }
      res.resolve();
    });
  }
}
