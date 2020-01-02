import { Directive } from '@angular/core';
import { HG_RESOLVERS, Resolver } from 'hg-resolvers';
import { PostService } from '../post.service';
import { IPost } from 'src/app/shared/interfaces';

@Directive({
  selector: '[appPostsListResolver]',
  providers: [{
    provide: HG_RESOLVERS,
    useExisting: PostsListResolverDirective,
    multi: true
  }],
  exportAs: 'postsListResolver'
})
export class PostsListResolverDirective extends Resolver<IPost[]> {

  // autoUniqueId = true;

  constructor(postService: PostService) {
    super(postService.loadPosts);
  }
}
