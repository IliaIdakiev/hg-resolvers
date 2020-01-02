import { Directive, Input } from '@angular/core';
import { HG_RESOLVERS, Resolver, ResolverConfig, toObservable } from 'hg-resolvers';
import { UserService } from '../user.service';
import { Observable } from 'rxjs';
import { IPost } from 'src/app/shared/interfaces';


@Directive({
  selector: '[appUserPostsResolver]',
  providers: [{
    provide: HG_RESOLVERS,
    useExisting: UserPostsResolverDirective,
    multi: true
  }],
  exportAs: 'userPostsResolver'
})
export class UserPostsResolverDirective extends Resolver<IPost[]> {

  @Input('appUserPostsResolver') shouldSkip;

  @Input() @toObservable selectedId: Observable<number>;

  config = ResolverConfig.AutoResolve;

  constructor(userService: UserService) {
    super(userService.loadUserPosts, () => this.selectedId);
  }

}
