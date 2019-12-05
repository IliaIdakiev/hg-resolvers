// import { Directive, Input } from '@angular/core';
// import { UserListModel } from '../+store/models/list';
// import { HG_ASYNC_RENDER_RESOLVER, AsyncRenderResolver, ResolverConfig } from 'hg-async-render';
// import { of, merge, interval } from 'rxjs';
// import { delay, tap, map, take } from 'rxjs/operators';

// @Directive({
//   selector: '[appUserPostDepAsyncResolver]',
//   providers: [
//     {
//       provide: HG_ASYNC_RENDER_RESOLVER,
//       useExisting: UserPostDepResolverDirective,
//       multi: true
//     }
//   ]
// })
// export class UserPostDepResolverDirective extends AsyncRenderResolver {
//   config = ResolverConfig.AutoResolveOnce;

//   // tslint:disable-next-line:no-input-rename
//   @Input('appUserPostDepAsyncResolver') shouldSkip;

//   constructor(userListModel: UserListModel) {
//     super(
//       {
//         loadAction: ([id]) => userListModel.loadUserPost(id),
//         cancelAction: userListModel.cancelLoadUserPost,
//         success$: userListModel.userPostLoadSuccess$,
//         failure$: userListModel.userPostLoadFailure$,
//       },
//       interval(10000).pipe(map(x => x + 1), take(5))
//     );
//   }
// }
