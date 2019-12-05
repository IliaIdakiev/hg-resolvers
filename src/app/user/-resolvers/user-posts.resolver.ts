import { Directive, Input } from '@angular/core';
import { HG_ASYNC_RENDER_RESOLVER, AsyncRenderResolver, ResolverConfig, toObservable } from 'hg-async-render';
import { UserService } from '../user.service';
import { Observable } from 'rxjs';


@Directive({
  selector: '[appUserPostsResolver]',
  providers: [{
    provide: HG_ASYNC_RENDER_RESOLVER,
    useExisting: UserPostsResolverDirective,
    multi: true
  }],
  exportAs: 'userPostsResolver'
})
export class UserPostsResolverDirective extends AsyncRenderResolver {

  @Input('appUserPostsResolver') shouldSkip;

  @Input() @toObservable selectedId: Observable<number>;

  config = ResolverConfig.AutoResolve;

  constructor(userService: UserService) {
    super(userService.loadUserPosts, () => this.selectedId);
  }

}
