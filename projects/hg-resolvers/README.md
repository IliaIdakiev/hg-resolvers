# HG Resolvers

Are you sick of the navigation blocking Angular resolvers. No problem... just use the hg-resolve component/directive for the different parts of you app that need to be rendered 
and create resolver directives that you can attach to the inidvidual resolve components. You can also provide your cool loader to be visualized while loading
the data or you can use the exported hg resolve component/directive (using `hgResolver`) with a template variable to be able to get access to the `isLoading` variable. You can also trigger a refresh on all of the resolvers by using the `refresh$.next()` subject method or trigger a individual resolve by querying the directive with ViewChild and calling the `resolve()` method. You can also configure the resolvers to resolve automatically on stream emissions. For more info check out the [app](https://stackblitz.com/github/IliaIdakiev/hg-resolve) or look bellow. Happy coding!

## Installation
`yarn add hg-resolvers` || `npm i hg-resolvers`

## Usage
You can check the `src` folder of this repo for a more detailed explanation but the usage is as follows:

### 1. Configiration (import the HGResolversModule to your module) 

```typescript
import { HGResolversModule } from 'hg-resolvers';

@NgModule({
  declarations: [
    // your declarations...
  ],
  imports: [
    // your imports...
    HGResolversModule,
  ],
  providers: [
    // your providers...
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 2. Create your first action based resolver (alternatively you can create a regular resolver with a function call that returns an observable - [view here](https://github.com/IliaIdakiev/hg-resolvers#3-regular-resolver))

```typescript
import { Directive } from '@angular/core';
import { Resolver, HG_RESOLVERS } from 'hg-resolvers';

@Directive({
  selector: '[appUserListResolver]',
  providers: [
    {
      provide: HG_RESOLVERS, // use this injector token
      useExisting: UserListResolverDirective, // use the name of your directive
      multi: true // use milti providers
    }
  ]
})
export class UserListResolverDirective extends Resolver {
  constructor(service: YourService) {
    super({
      loadAction: service.loadUsers, // the method that dispatches the load action or sends the actual load request
      cancelAction: service.cancelLoadUsers, // the method that dispatches the cancel load request or does the actual request cancellation
      success$: service.userLoadSuccess$, // a RxJS stream that emits when the data is loaded successfuly
      failure$: service.userLoadFailure$ // a RxJS stream that emits when the data fails to load
    });
  }
}

```

### 3. Use the hg resolve component and the resolver from step.2 (you can also use [hgResolve] directive - [look here](https://github.com/IliaIdakiev/hg-resolvers#1-use-the-resolve-directive-to-skip-the-additional-element-added-and-use-a-custom-loader))
```html
<!-- If you want you can create a loader template that will be used while loading -->
<ng-template #loader let-isLoading>
  <app-loader loaderSize="small" [visible]="isLoading" [localLoader]="true"></app-loader>
</ng-template>
<div>  
  <!-- Or you can use the userListResolve template variable to manually show hide a loader or a unicorn -->
  <div>UserListIsLoading: {{userListResolve.isLoading}}</div>
  <!-- You can use the refresh$.next() to trigger a reload if necessary -->
  <button (click)="userListResolve.refresh$.next()">Reload Users</button>
  <!-- Use the hg-resolve component and feed it with our shiny loader. Alos put the appUserListResolver directive that we've created in task 2 (don't forget to put it inside the declarations array inside your module before using it). If you need multiple resolvers for the current resolve container just put all the directives on the opening tag -->
  <hg-resolve [loaderTemplateRef]="loader" #userListResolve="hgResolve" appUserListResolver>
    <h1>User List</h1>
    <ul>
      <li *ngFor="let user of users$ | async"> {{ user.email }}</li>
    </ul>
  </hg-resolve>
</div>
```

Resolve Component Inputs:
```typescript
@Input() loaderTemplateRef: TemplateRef<any>; // the template that will be used for the loader
@Input() errorTemplateRef: TemplateRef<any>; // the template that will be used for the error
@Input() autoHideLoader = false; // auto hide the loader template on loading
@Input() autoShowError = false; // auth show the error template on error
```

### [4. DEMO](https://stackblitz.com/github/IliaIdakiev/hg-resolvers)

## More Congifirations

### 1. Use the resolve directive to skip the additional element added and use a custom loader
```html
<div>UserPostDepIsLoading (Directive): {{hgResolve.isLoading}}</div>
<button (click)="hgResolve.refresh$.next()">Reload User Post</button>
<ng-template hgResolve #hgResolve="hgResolve" appUserPostDepResolver>
  <h1>Post</h1>
  {{ post$ | async | json }}
</ng-template>
```
⚠️**Since the directive is rendering the template there is no loaderTemplateRef binding. But it's not actually needed since you can just put the loader itself info the template and use the template varialbe to access the state**

### 2. You can also additionally configure the resolvers

```typescript
import { Directive } from '@angular/core';
import { Resolver, HG_RESOLVERS, ResolverConfig } from 'hg-resolvers';

@Directive({
  selector: '[appUserListResolver]',
  providers: [
    {
      provide: HG_RESOLVERS, // use this injector token
      useExisting: UserListResolverDirective, // use the name of your directive
      multi: true // use milti providers
    }
  ]
})
export class UserListResolverDirective extends Resolver {
  // tslint:disable-next-line:no-input-rename
  @Input('appUserListResolverDirective') shouldSkip: boolean;
  // set the attribute binding appUserListResolverDirective ([appUserListResolverDirective]="true") 
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
import { Resolver, HG_RESOLVERS } from 'hg-resolvers';
import { HttpClient } from '@angular/common/http';

@Directive({
  selector: '[appSimpleUserListResolver]',
  providers: [
    {
      provide: HG_RESOLVERS,
      useExisting: SimpleUserListResolverDirective,
      multi: true
    }
  ],
  exportAs: 'appSimpleUserListResolver' 
  // since we want to be able to access the directive trough 
  // a template variable we have to export it. (insde the 
  // html we will have #resolver="appSimpleUserListResolver")
})
export class SimpleUserListResolverDirective extends Resolver {

  // transfer the appSimpleUserListResolver input into shouldSkip to skip the current resolver

  // tslint:disable-next-line:no-input-rename
  @Input('appSimpleUserListResolver') shouldSkip;

  constructor(http: HttpClient) {
    // the function that we provide to super would usually be a user serice load method
    super(() => http.get('https://jsonplaceholder.typicode.com/users')); 
  }
}
```
**The result can be accessed via the data$ property on the resolver directive. You can either use ViewChild to get the directive and access the data$ property or by using a template variable like:**

```html
<ng-template hgResolve #simpleUserListResolve="hgResolve"
      [appSimpleUserListResolver]="false" #resolver="appSimpleUserListResolver">
  <h1>User List</h1>
  <ul>
    <li *ngFor="let user of (resolver.data$ | async)"> {{ user.email }}</li>
  </ul>
</ng-template>
```

### 4. Error Handling

Each resolver has an error property that will contain the error if one exists. You can use this property inside your templates via template reference variable containing the resolver instance (just like the one with name `resolver` from the code above section 4) to present the error message/code to the user.

[Check our website](https://hillgrand.com/);