// import { Directive } from '@angular/core';
// import { UserListModel } from '../+store/models/list';
// import { HG_ASYNC_RENDER_RESOLVER, AsyncRenderResolver } from 'hg-async-render';

// @Directive({
//   selector: '[appUserPostListAsyncResolver]',
//   providers: [
//     {
//       provide: HG_ASYNC_RENDER_RESOLVER,
//       useExisting: UserPostListResolverDirective,
//       multi: true
//     }
//   ]
// })
// export class UserPostListResolverDirective extends AsyncRenderResolver {

//   constructor(userListModel: UserListModel) {
//     super({
//       loadAction: userListModel.loadUserPosts,
//       cancelAction: userListModel.cancelLoadUserPosts,
//       success$: userListModel.userPostsLoadSuccess$,
//       failure$: userListModel.userPostsLoadFailure$
//     });
//   }
// }
