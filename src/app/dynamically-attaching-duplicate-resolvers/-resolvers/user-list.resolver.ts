import { Directive } from '@angular/core';
import { Resolver, HG_RESOLVERS } from 'hg-resolvers';
import { UserService } from '../../user.service';

@Directive({
  selector: '[appUserListResolver]',
  // We need to add multi provide the directive so it can get registered on the resolve contauner
  providers: [
    {
      provide: HG_RESOLVERS,
      multi: true,
      useExisting: UserListResolverDirective
    }
  ],
  exportAs: 'appUserListResolver'
}) export class UserListResolverDirective extends Resolver<any[]> {

  resolveOnInit = true;

  constructor(userService: UserService) {
    super(() => userService.loadUsers());
  }
}
