import { Directive } from '@angular/core';
import { HG_ASYNC_RENDER_RESOLVER, AsyncRenderResolver } from 'hg-async-render';
import { UserService } from '../user.service';

@Directive({
  selector: '[appUserListResolver]',
  providers: [{
    provide: HG_ASYNC_RENDER_RESOLVER,
    useExisting: UserListResolverDirective,
    multi: true
  }],
  exportAs: 'userListResolver'
})
export class UserListResolverDirective extends AsyncRenderResolver {

  constructor(userService: UserService) {
    super(userService.loadUsers);
  }
}
