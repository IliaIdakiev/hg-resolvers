import { Directive } from '@angular/core';
import { Resolver, HG_RESOLVERS } from 'hg-resolvers';
import { UserService } from '../../user.service';

@Directive({
  selector: '[appUserListResolver]',
  // This part is only necessary if you are using the resolver with a resolve container
  // but it's a good practice to always have it because if you foget to add it eveything will
  // misteriously fail, just like in my demo @AngularAir :)
  // Just to show that it will work I will leave it commented out for now.
  // providers: [
  //   {
  //     provide: HG_RESOLVERS,
  //     multi: true,
  //     useExisting: UserListResolverDirective
  //   }
  // ],
  exportAs: 'appUserListResolver'
}) export class UserListResolverDirective extends Resolver<any[]> {

  // resolveOnInit = true; (default value is true)

  constructor(userService: UserService) {
    super(() => userService.loadUsers());
  }
}
