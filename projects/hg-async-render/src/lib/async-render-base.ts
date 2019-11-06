import { AsyncRenderResolver } from '../lib/async-render-resolver';

export class AsyncRenderBase {

  constructor(private resolvers: AsyncRenderResolver<any>[] = []) {
    this.resolvers = [].concat(this.resolvers || []);
  }

  get isLoading() {
    return this.resolvers.reduce((acc, res) => acc || res.state.loading, false);
  }

  get hasError() {
    return this.resolvers.reduce((acc, res) => acc || res.state.errored, false);
  }

  destroy() {
    this.resolvers.forEach(res => res.destroy());
  }

  resolve() {
    this.resolvers.forEach(res => {
      if (res.shouldSkip) { return; }
      res.resolve();
    });
  }
}
