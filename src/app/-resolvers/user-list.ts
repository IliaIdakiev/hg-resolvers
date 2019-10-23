import { Directive } from '@angular/core';
import { UserListModel } from '../+store/models/list';
import { AsyncRenderResolver, HG_ASYNC_RENDER } from 'hg-async-render';

@Directive({
  selector: '[appUserListAsyncResolver]',
  providers: [
    {
      provide: HG_ASYNC_RENDER,
      useExisting: UserListAsyncResolverDirective,
      multi: true
    }
  ]
})
export class UserListAsyncResolverDirective extends AsyncRenderResolver {
  constructor(userModel: UserListModel) {
    super(
      userModel.loadUsers,
      userModel.cancelLoadUsers,
      userModel.userLoadSuccess$,
      userModel.userLoadFailure$
    );
  }
}
