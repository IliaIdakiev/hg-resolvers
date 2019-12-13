import { Directive } from '@angular/core';
import { HG_ASYNC_RENDER_RESOLVER, AsyncRenderResolver } from 'hg-async-render';
import { PostService } from '../post.service';
import { IPost } from 'src/app/shared/interfaces';

@Directive({
  selector: '[appPostsListResolver]',
  providers: [{
    provide: HG_ASYNC_RENDER_RESOLVER,
    useExisting: PostsListResolverDirective,
    multi: true
  }],
  exportAs: 'postsListResolver'
})
export class PostsListResolverDirective extends AsyncRenderResolver<IPost[]> {

  autoUniqueId = true;

  constructor(postService: PostService) {
    super(postService.loadPosts);
  }
}
