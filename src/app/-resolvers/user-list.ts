import { Directive, Input } from '@angular/core';
import { UserListModel } from '../+store/models/list';
import { AsyncRenderResolver, HG_ASYNC_RENDER_RESOLVER } from 'hg-async-render';

@Directive({
  selector: '[appUserListAsyncResolver]',
  providers: [
    {
      provide: HG_ASYNC_RENDER_RESOLVER,
      useExisting: UserListAsyncResolverDirective,
      multi: true
    }
  ]
})
export class UserListAsyncResolverDirective extends AsyncRenderResolver {

  // transfer the appUserListAsyncResolver input into shouldSkip that is used inside AsyncRenderResolver to skip the current resolver
  // tslint:disable-next-line:no-input-rename
  @Input('appUserListAsyncResolver') shouldSkip;

  constructor(userModel: UserListModel) {
    super(
      userModel.loadUsers,
      userModel.cancelLoadUsers,
      userModel.userLoadSuccess$,
      userModel.userLoadFailure$
    );
  }

}
