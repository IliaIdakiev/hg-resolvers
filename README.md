# Angular Async Render (_Async Resolvers_)

Are you sick of the navigation blocking Angular resolver. No problem... just use the async-render component for the different parts of you app that need to be rendered 
and create directive resolvers that you can attach to the inidvidual async render components. You can also provide your cool loader to be visualized while loading
the data or you can use the exported async render component/directive (using `asyncRender`) with a template variable to be able to get access to the `isLoading` variable. You can also trigger a refresh on all of the resolvers by using the `refresh$.next()` subject method or trigger a individual resolve by querying the directive with ViewChild and calling the `resolve()` method. You can also configure the resolvers to resolve automatically stream emissions. For more info check out the [app](https://stackblitz.com/github/IliaIdakiev/async-render) or look bellow. Happy coding!

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

### 2. Create your first action based resolver (alternatively you can create a regular resolver with a function call that returns an observable - [view here](https://github.com/IliaIdakiev/async-render#3-regular-resolver))

```typescript
import { Directive } from '@angular/core';
import { AsyncRenderResolver, HG_ASYNC_RENDER_RESOLVER } from 'hg-async-render';

@Directive({
  selector: '[appUserListAsyncResolver]',
  providers: [
    {
      provide: HG_ASYNC_RENDER_RESOLVER, // use this injector token
      useExisting: UserListAsyncResolverDirective, // use the name of your directive
      multi: true // use milti providers
    }
  ]
})
export class UserListAsyncResolverDirective extends AsyncRenderResolver {

  // (Optional)
  @Input('appUserPostDepAsyncResolver') shouldSkip: boolean; // Skipping a resolution
  // Inside the template set the attribute binding appUserPostDepAsyncResolver ([appUserPostDepAsyncResolver]="true") 
  // to the local shouldSkip property
  
  // (Optional / Default value: ResolverConfig.Default)
  config: ResolverConfig = ResolverConfig.Default; // Resolver behaviour
  // * ResolverConfig.Default - don't auto resolve when skip or a depenency changes/emits.
  // * ResolverConfig.AutoResolve - auto resolve when skip or a depenency changes/emits.
  // * ResolverConfig.AutoResolveOnce - auto resolve once when skip or a depenency changes/emits (look at the scenarios bellow).
  // 
  // ⚠️Scenarios for ResolverConfig.AutoResolveOnce:
  // 1. if shouldSkip = true
  //    the resolver will be skiped until the shouldSkip is set to false. When that happens a resolve will be triggered
  // 2. if shouldSkip = false
  //    the resolver will dispatch the resolve call and there won't be any auto resolves triggered 
  //    (the only way to dispatch a resolve is via refresh$.next())

  constructor(service: YourService) {
    // When you are using a service directly you can pass the method that reurns the http observable stream
    super(serice.loadUsers);
    // DEPENDENCIES (Optional)
    // If we have dependencies that the loadUsers function needs to accept you can pass them as a second argument.
    // the accepted type for the dependecies is dependencies?: () => (Observable<any> | any[]) | Observable<any> | Observable<any>[]

    // NGRX or something similar:
    // super({
    //   loadAction: service.loadUsers, // the method that dispatches the load action or sends the actual load request
    //   cancelAction: service.cancelLoadUsers, // the method that dispatches the cancel load request or does the actual request cancellation
    //   success$: service.userLoadSuccess$, // a RxJS stream that emits when the data is loaded successfuly
    //   failure$: service.userLoadFailure$ // a RxJS stream that emits when the data fails to load
    // });
  }
}

```

### 3. Use the hg-async-render.component or the [[hgAsyncRender] directive](https://github.com/IliaIdakiev/async-render#1-use-the-async-render-directive-to-skip-the-additional-element-added-and-use-a-custom-loader) and add the resolver from step.2
```html
<!-- If you want you can create a loader template that will be used while loading -->
<ng-template #loader let-isLoading>
  <app-loader loaderSize="small" [visible]="isLoading" [localLoader]="true"></app-loader>
</ng-template>
<ng-template #error let-hasError let-errors="errors">
  <div *ngIf="hasError">{{errors | json}}</div>
</ng-template>
<div>  
  <!-- Or you can use the userListAsyncRender template variable to manually show hide a loader or a unicorn -->
  <div>UserListIsLoading: {{userListAsyncRender.isLoading}}</div>
  <!-- You can use the refresh$.next() or just call the resolve() method to trigger a reload if necessary -->
  <button (click)="userListAsyncRender.refresh$.next()">Reload Users</button>
  <!-- Use the hg-async-render component and feed it with our shiny loader. Also put the appUserListAsyncResolver directive that we've created in task 2 (don't forget to put it inside the declarations array inside your module before using it). If you need multiple resolvers for the current async-render just put all the directives on the opening tag -->
  <hg-async-render [loaderTemplateRef]="loader" [errorTemplateRef]="error" #userListAsyncRender="asyncRender" appUserListAsyncResolver>
    <!-- If you don't want to manage when the error and loader shows you can also provide [autoControlLoader]="true" or [autoControlError]="true" to delegate the showing and hiding of the templates to the async-render component -->
    <h1>User List</h1>
    <ul>
      <!-- every resolver has a data$ observable property from where you can access the data directly in the template -->
      <li *ngFor="let user of (userListAsyncRender.data$ | async)"> {{ user.email }}</li>
    </ul>
  </hg-async-render>
</div>
```

Async Render Component Inputs:
```typescript
@Input() loaderTemplateRef: TemplateRef<any>; // the template that will be used for the loader
@Input() errorTemplateRef: TemplateRef<any>; // the template that will be used for the error
@Input() autoControlLoader = false; // auto hide/show the loader template on loading
@Input() autoControlError = false; // auth hide/show the error template on error
```

Async Render Properties:
```typescript
  errors: Error[]; // an array with all the errors
  isLoading: boolean;
  hasError: boolean;
  refresh$: Subject<boolean>
  resolve(): () => void;
```

### [4. DEMO](https://stackblitz.com/github/IliaIdakiev/async-render)

## More Congifirations

### 1. Use the async render directive to skip the additional element added and use a custom loader
```html
<div>UserPostDepIsLoading (Directive): {{asyncRender.isLoading}}</div>
<button (click)="asyncRender.refresh$.next()">Reload User Post</button>
<ng-container hgAsyncRender #asyncRender="asyncRender" appUserPostDepAsyncResolver>
  <h1>Post</h1>
  {{ post$ | async | json }}
</ng-container>
```
⚠️**Since the directive is rendering the template there is no loaderTemplateRef binding. But it's not actually needed since you can just put the loader itself info the template and use the template varialbe to access the state**

### 2. You can also additionally configure the resolvers

```typescript
import { Directive } from '@angular/core';
import { AsyncRenderResolver, HG_ASYNC_RENDER_RESOLVER, ResolverConfig } from 'hg-async-render';

@Directive({
  selector: '[appUserListAsyncResolver]',
  providers: [
    {
      provide: HG_ASYNC_RENDER_RESOLVER, // use this injector token
      useExisting: UserListAsyncResolverDirective, // use the name of your directive
      multi: true // use milti providers
    }
  ]
})
export class UserListAsyncResolverDirective extends AsyncRenderResolver {
  // tslint:disable-next-line:no-input-rename
  @Input('appUserPostDepAsyncResolver') shouldSkip: boolean;
  // set the attribute binding appUserPostDepAsyncResolver ([appUserPostDepAsyncResolver]="true") 
  // to the local shouldSkip property (writing it this way is faster and with less code)
  

  config: ResolverConfig = ResolverConfig.AutoResolve; 
  // ResolverConfig.Default - don't auto resolve when skip or a depenency changes/emits.

  // ResolverConfig.AutoResolve - auto resolve when skip or a depenency changes/emits.

  // ResolverConfig.AutoResolveOnce - auto resolve once when skip or a depenency changes/emits (look at the scenarios bellow).
  // 
  // ⚠️Scenarios for ResolverConfig.AutoResolveOnce:
  // 1. if shouldSkip = true
  //    the resolver will be skiped until the shouldSkip is set to false. When that happens a resolve will be triggered
  // 2. if shouldSkip = false
  //    the resolver will dispatch the resolve call and there won't be any auto resolves triggered 
  //    (the only way to dispatch a resolve is via refresh$.next())

  constructor(service: YourService) {
    super(
      {
        loadAction: ([dependecyStreamData1, dependecyStreamData2, dependecyStreamData3]) => service.loadSomething(dependecyStreamData1, dependecyStreamData2, dependecyStreamData3), // the method that dispatches the load action or sends the actual load request
        cancelAction: service.cancelLoadUsers, // the method that dispatches the cancel load request or does the actual request cancellation
        success$: service.userLoadSuccess$, // a RxJS stream that emits when the data is loaded successfuly
        failure$: service.userLoadFailure$ // a RxJS stream that emits when the data fails to load
      },
    [dependecyStream1$, dependecyStream2$, dependecyStream3$] // a RxJS observable or array of observables that we depend on (the stream values can be used inside the load function (the first argument of the super call))
    );
  }
}

```

### 3. Regular Resolver

```typescript
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
  // since we want to be able to access the directive trough 
  // a template variable we have to export it. (insde the 
  // html we will have #resolver="appSimpleUserListAsyncResolver")
})
export class SimpleUserListAsyncResolverDirective extends AsyncRenderResolver {

  // transfer the appUserListAsyncResolver input into shouldSkip that is used inside 
  // AsyncRenderResolver to skip the current resolver

  // tslint:disable-next-line:no-input-rename
  @Input('appSimpleUserListAsyncResolver') shouldSkip;

  constructor(http: HttpClient) {
    // the function that we provide to super would usually be a user serice load method
    super(() => http.get('https://jsonplaceholder.typicode.com/users')); 
  }
}
```
**The result can be accessed via the data$ property on the resolver directive. You can either use ViewChild to get the directive and access the data$ property or by using a template variable like:**

```html
<ng-template hgAsyncRender #simpleUserListAsyncRenderDirective="asyncRender"
      [appSimpleUserListAsyncResolver]="false" #resolver="appSimpleUserListAsyncResolver">
  <h1>User List</h1>
  <ul>
    <li *ngFor="let user of (resolver.data$ | async)"> {{ user.email }}</li>
  </ul>
</ng-template>
```

### 4. Error Handling

Each resolver has an error property that will contain the error if one exists. You can use this property inside your templates via template reference variable containing the resolver instance (just like the one with name `resolver` from the code above section 4) to present the error message/code to the user.

[Check our website](https://hillgrand.com/);