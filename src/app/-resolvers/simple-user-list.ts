import { Directive, Input } from '@angular/core';
import { AsyncRenderResolver, HG_ASYNC_RENDER_RESOLVER } from 'hg-async-render';
import { HttpClient } from '@angular/common/http';

@Directive({
  selector: '[appSimpleUserListAsyncResolver]',
  providers: [
    {
      provide: HG_ASYNC_RENDER_RESOLVER,
      useExisting: SimpleUserListAsyncResolverDirective,
      multi: true
    }
  ],
  exportAs: 'appSimpleUserListAsyncResolver'
})
export class SimpleUserListAsyncResolverDirective extends AsyncRenderResolver {

  // transfer the appUserListAsyncResolver input into shouldSkip that is used inside AsyncRenderResolver to skip the current resolver
  // tslint:disable-next-line:no-input-rename
  @Input('appSimpleUserListAsyncResolver') shouldSkip;

  constructor(http: HttpClient) {
    super(() => http.get('https://jsonplaceholder.typicode.com/users'));
  }

}
