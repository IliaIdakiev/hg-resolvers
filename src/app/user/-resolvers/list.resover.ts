import { Directive } from '@angular/core';
import { HG_RESOLVERS, Resolver } from 'hg-resolvers';
import { UserService } from '../user.service';
import { IUser } from 'src/app/shared/interfaces';

@Directive({
  selector: '[appUserListResolver]',
  providers: [{
    provide: HG_RESOLVERS,
    useExisting: UserListResolverDirective,
    multi: true
  }],
  exportAs: 'userListResolver'
})
export class UserListResolverDirective extends Resolver<IUser[]> {

  constructor(userService: UserService) {
    super(userService.loadUsers);
  }
}
