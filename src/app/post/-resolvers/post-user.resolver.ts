import { Directive, Input } from '@angular/core';
import { HG_ASYNC_RENDER_RESOLVER, AsyncRenderResolver, ResolverConfig, toObservable } from 'hg-async-render';
import { PostService } from '../post.service';
import { Observable } from 'rxjs';
import { IUser } from 'src/app/shared/interfaces';

@Directive({
  selector: '[appPostUserResolver]',
  providers: [{
    provide: HG_ASYNC_RENDER_RESOLVER,
    useExisting: PostUserResolverDirective,
    multi: true
  }],
  exportAs: 'postUserResolver'
})
export class PostUserResolverDirective extends AsyncRenderResolver<IUser, [number]> {

  uid = 1;

  @Input('appPostUserResolver') shouldSkip;

  @Input() @toObservable selectedId: Observable<number>;

  config = ResolverConfig.AutoResolve;

  constructor(postService: PostService) {
    super(postService.loadPostUser, () => this.selectedId);
  }

}
