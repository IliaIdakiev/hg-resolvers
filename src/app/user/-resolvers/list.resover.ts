import { Directive } from '@angular/core';
import { HG_ASYNC_RENDER_RESOLVER, AsyncRenderResolver } from 'hg-async-render';
import { UserService } from '../user.service';
import { IUser } from 'src/app/shared/interfaces';

@Directive({
  selector: '[appUserListResolver]',
  providers: [{
    provide: HG_ASYNC_RENDER_RESOLVER,
    useExisting: UserListResolverDirective,
    multi: true
  }],
  exportAs: 'userListResolver'
})
export class UserListResolverDirective extends AsyncRenderResolver<IUser[]> {

  constructor(userService: UserService) {
    super(userService.loadUsers);
  }
}
