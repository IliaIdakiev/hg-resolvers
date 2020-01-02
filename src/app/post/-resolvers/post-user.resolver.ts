import { Directive, Input } from '@angular/core';
import { HG_RESOLVERS, Resolver, ResolverConfig, toObservable } from 'hg-resolvers';
import { PostService } from '../post.service';
import { Observable } from 'rxjs';
import { IUser } from 'src/app/shared/interfaces';

@Directive({
  selector: '[appPostUserResolver]',
  providers: [{
    provide: HG_RESOLVERS,
    useExisting: PostUserResolverDirective,
    multi: true
  }],
  exportAs: 'postUserResolver'
})
export class PostUserResolverDirective extends Resolver<IUser, [number]> {

  uid = 1;

  @Input('appPostUserResolver') shouldSkip;

  @Input() @toObservable selectedId: Observable<number>;

  config = ResolverConfig.AutoResolve;

  constructor(postService: PostService) {
    super(postService.loadPostUser, () => this.selectedId);
  }

}
