# Async Render

Are you sick of navigation blocking Angular resolver. No problem... just use the async-render component for the different parts of you app that need to be rendered 
and create directive resolvers that you can attach to the inidvidual async render components. You can also provide your cool loader to be visualized while loading
the data or you can use the exported async render component (using `asyncRender`) with a template variable to be able to get access to the `isLoading` variable. You can also trigger a refresh by using the `refresh$.next()` subject method. For more info check out the [app](https://stackblitz.com/github/IliaIdakiev/async-render) or look bellow. Happy coding!

## Installation
`yarn add hg-async-render` || `npm i hg-async-render`

## Usage
You can check the `src` folder of this repo for a more detailed explanation but the usage is as follows:

### 1. Configiration (import the AsyncRenderModule to your module) 

```typescript
import { AsyncRenderModule } from 'hg-async-render';

@NgModule({
  declarations: [
    // your declarations...
  ],
  imports: [
    // your imports...
    AsyncRenderModule,
  ],
  providers: [
    // your providers...
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 2. Create your first resolver

```typescript
import { Directive } from '@angular/core';
import { AsyncRenderResolver, HG_ASYNC_RENDER } from 'hg-async-render';

@Directive({
  selector: '[appUserListAsyncResolver]',
  providers: [
    {
      provide: HG_ASYNC_RENDER, // use this injector token
      useExisting: UserListAsyncResolverDirective, // use the name of your directive
      multi: true // use milti providers
    }
  ]
})
export class UserListAsyncResolverDirective extends AsyncRenderResolver {
  constructor(service: YourService) {
    super(
      service.loadUsers, // the method that dispatches the load action or sends the actual load request
      service.cancelLoadUsers, // the method that dispatches the cancel load request or does the actual request cancellation
      service.userLoadSuccess$, // a RxJS stream that emits when the data is loaded successfuly
      service.userLoadFailure$ // a RxJS stream that emits when the data fails to load
    );
  }
}

```

### 3. Use the async render component and the resolver from step.2 
```html
<!-- If you want you can create a loader template that will be used while loading -->
<ng-template #loader let-isLoading>
  <app-loader loaderSize="small" [visible]="isLoading" [localLoader]="true"></app-loader>
</ng-template>
<div>  
  <!-- Or you can use the userListAsyncRender template variable to manually show hide a loader or a unicorn -->
  <div>UserListIsLoading: {{userListAsyncRender.isLoading}}</div>
  <!-- You can use the refresh$.next() to trigger a reload if necessary -->
  <button (click)="userListAsyncRender.refresh$.next()">Reload Users</button>
  <!-- Use the hg-async-render component and feed it with our shiny loader. Alos put the appUserListAsyncResolver directive that we've created in task 2 (don't forget to put it inside the declarations array inside your module before using it). If you need multiple resolvers for the current async-render just put all the directives on the opening tag -->
  <hg-async-render [loaderTemplateRef]="loader" #userListAsyncRender="asyncRender" appUserListAsyncResolver>
    <h1>User List</h1>
    <ul>
      <li *ngFor="let user of users$ | async"> {{ user.email }}</li>
    </ul>
  </hg-async-render>
</div>
```

### [4. DEMO](https://stackblitz.com/github/IliaIdakiev/async-render)

[Check our website](https://hillgrand.com/);