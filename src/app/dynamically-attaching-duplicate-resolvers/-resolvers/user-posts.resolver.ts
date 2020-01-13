import { Directive, Input } from '@angular/core';
import { Resolver, HG_RESOLVERS, ResolverConfig, toObservable } from 'hg-resolvers';
import { PostService } from '../../post.service';
import { Observable } from 'rxjs';

@Directive({
  selector: '[appUserPostsResolver]',
  providers: [
    {
      provide: HG_RESOLVERS,
      multi: true,
      useExisting: UserPostsResolverDirective
    }
  ],
  exportAs: 'appUserPostsResolver'
}) export class UserPostsResolverDirective extends Resolver<any[]> {

  @Input('appUserPostsResolver') shouldSkip;

  // We would like to auto resolve (re-fetch the data) this resolver anytime a dependency stream emits
  // so we use the ResolverConfig.AutoResolve value. If you want it to resolve only once (after the first emission of the dependencies)
  // you can use ResolverConfig.AutoResolveOnce;
  // Keep in mind that if config is ResolverConfig.AutoResolve or ResolverConfig.AutoResolveOnce the resolve process is detached
  // from the resolve container but the resolver state is still calculated to the global resolve container state.
  config = ResolverConfig.AutoResolve;

  // we convert the normal @Input to an observable uisng the @toObservable decorator from the library
  @Input() @toObservable selectedUserId: Observable<number>;

  // Create a uniqueId for this resolver
  // Resolvers with the same id inside the same resolve container become connected
  // (meaning that the don't make extra calls for loading the data - they reuse the data)
  autoUniqueId = true; // or use uid = 'somestring';

  constructor(postService: PostService) {
    super(
      ([id]: [number]) => postService.loadUserPosts(id), // resolve dunction that accepts an array with all the provided dependency values
      () => this.selectedUserId // dependency factory function that returns must return an observable with all dependency streams
    );
  }

}
