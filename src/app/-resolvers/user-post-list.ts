import { Directive } from '@angular/core';
import { UserListModel } from '../+store/models/list';
import { HG_ASYNC_RENDER, AsyncRenderResolver } from 'async-render';

@Directive({
  selector: '[appUserPostListAsyncResolver]',
  providers: [
    {
      provide: HG_ASYNC_RENDER,
      useExisting: UserPostListResolverDirective,
      multi: true
    }
  ]
})
export class UserPostListResolverDirective extends AsyncRenderResolver {

  constructor(userListModel: UserListModel) {
    super(
      userListModel.loadUserPosts,
      userListModel.cancelLoadUserPosts,
      userListModel.userPostsLoadSuccess$,
      userListModel.userPostsLoadFailure$
    );
  }
}
