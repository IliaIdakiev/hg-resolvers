# HG Resolvers

Are you sick of the navigation blocking Angular resolvers. No problem... just use the hg-resolve component/directive for the different parts inside your component templates that need to load and present data and create reusable resolver directives that you can attach to the inidvidual resolve components/directives. You can also provide your cool loader to be visualized while loading
the data or you can use the exported hg resolve component/directive (using `hgResolver`) with a template variable to be able to get access to the state (Pending, Resolving, Settled, Errored, Completed) using  the variables - `isResolving`, `isSettled` and so on. You can also trigger a refresh on all of the resolvers by using the `resolve` method or `refresh$.next()` subject on the resolve component/directive or trigger a individual resolve by querying the directive with ViewChild and calling the `resolve()` method inside the template. You can also configure the resolvers to resolve automatically on stream emissions. For more info check out the [DEMO APP](https://stackblitz.com/github/IliaIdakiev/hg-resolvers) or look bellow. Happy coding!

*NOTE: You can check the `src` folder of this repo for a more detailed explanation but the usage is as follows:*

## Video Presentation

[![Video image](https://img.youtube.com/vi/zZD-5Blf3B4/0.jpg)](https://youtu.be/zZD-5Blf3B4)

## Installation
`yarn add hg-resolvers` or `npm i hg-resolvers`

### 1. Simple Usage (Single resolve directive with no parent container)

Here we are asumming you have a userService loadUsers method that fetches an endpoint that returns an array of user objects

*user-list.resolver.ts*
```typescript 
import { Directive } from '@angular/core';
import { Resolver } from 'hg-resolvers';
import { UserService } from '../user.service';

@Directive({
  selector: '[appUserListResolver]',
  exportAs: 'appUserListResolver'
}) export class UserListResolverDirective extends Resolver<any[]> {

  constructor(userService: UserService) {
    super(() => userService.loadUsers());
  }
}
```

*some.component.html*
```html
<button (click)="userListResolver.resolve()">Load/Reload</button>
<div appUserListResolver #userListResolver="appUserListResolver">
  <div *ngIf="userListResolver.isResolving">Loading</div>
  <div *ngIf="!userListResolver.isResolving">{{userListResolver.data$ | async | json }}
  </div>
  <div *ngIf="userListResolver.isErrored">Error {{userListResolver.error}}</div>
</div>
```

Here we depend on clicking the button for the resolver to fetch the data and present it. But we can also extend our directive with a property `resolveOnInit = true;` that will trigger a resolve on init.

*NOTE: resolveOnInit (default value - true) only works when we don't have a resolve container (see the example bellow this one) and with ResolverConfig.Default (check out resolve config info if you don't understand this)*

*user-list.resolver.ts*
```typescript 
import { Directive } from '@angular/core';
import { Resolver } from 'hg-resolvers';
import { UserService } from '../user.service';

@Directive({
  selector: '[appUserListResolver]',
  exportAs: 'appUserListResolver'
}) export class UserListResolverDirective extends Resolver<any[]> {

  // resolveOnInit = true; (default value is true)

  constructor(userService: UserService) {
    super(() => userService.loadUsers());
  }
}
```

### 2. Using a resolve container

Because we want to use our resolver with a contaner we will have to multi-provide (something that we do when we create template driven form validation directives)

*user-list.resolver.ts*
```typescript 
import { Directive } from '@angular/core';
import { Resolver } from 'hg-resolvers';
import { UserService } from '../user.service';

@Directive({
  selector: '[appUserListResolver]',
  exportAs: 'appUserListResolver',
  // we need to add this:
  providers: [
    {
      provide: HG_RESOLVERS,
      useExisting: UserListResolverDirective,
      multi: true
    }
  ]
}) export class UserListResolverDirective extends Resolver<any[]> {

  // resolveOnInit = true; (default value is true) and if used it won't matter since we have a resolve container

  constructor(userService: UserService) {
    super(() => userService.loadUsers());
  }
}
```

*NOTE: Here we also use the ability to provide a template for while resolving and for when an error occurs*

and we will also need to add the `HGResolversModule` to the module that our directives are provided (in our case this will be the app module)

```typescript
@NgModule({
  declarations: [
    AppComponent,
    UserListComponent,
    UserListResolverDirective // we also need to provide our directives as usual
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    HGResolversModule // we need to add this line
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

*some.component.html*
```html
<ng-template #loader let-showLoading>
  <div *ngIf="showLoading">Loading...</div>
</ng-template>
<ng-template #error let-isErrored let-errors="errors">
  <div *ngIf="isErrored">{{errors | json}}</div>
</ng-template>

<hg-resolve appUserListResolver #userListResolver="appUserListResolver"
  [loaderTemplateRef]="loader" [errorTemplateRef]="error">
  {{userListResolver.data$ | async | json}}
</hg-resolve>
```

This code will trigger a resolve on init so if we dont' want that we will have to add the `[resolveOnInit]="false"` to the resolve contaner.

*some.component.html*
```html
<ng-template #loader let-showLoading>
  <div *ngIf="showLoading">Loading...</div>
</ng-template>
<ng-template #error let-isErrored let-errors="errors">
  <div *ngIf="isErrored">{{errors | json}}</div>
</ng-template>
<!-- resolveOnInit has a default value of true so you don't need to have if in this case -->
<hg-resolve [resolveOnInit]="true" appUserListResolver #userListResolver="appUserListResolver"
  [loaderTemplateRef]="loader" [errorTemplateRef]="error">
  {{userListResolver.data$ | async | json}}
</hg-resolve>
```

### 3. Adding more resolvers to our container

Sometimes we want to be able to resolve multiple things. So lets suppose that we have a similar resolver directive like the `UserListResolverDirective` one called `PostsListResolverDirective`

*some.component.html*
```html
<ng-template #loader let-showLoading>
  <div *ngIf="showLoading">Loading...</div>
</ng-template>
<ng-template #error let-isErrored let-errors="errors">
  <div *ngIf="isErrored">{{errors | json}}</div>
</ng-template>

<hg-resolve appUserListResolver appPostListResolver #userListResolver="appUserListResolver"
  #postListResolver="appPostListResolver" [loaderTemplateRef]="loader" [errorTemplateRef]="error">
  <h2>Users</h2>
  {{userListResolver.data$ | async | json}}
  <h2>Posts</h2>
  {{postListResolver.data$ | async | json }}
</hg-resolve>
```

### 4. Adding a resolver with dependencies

Sometimes we want to be able to resolve something depending on a value. If so we can use the additional function that the super class accepts as a second argument (the function has to return an observable! In our case we have an input that is a number so we will use the toObservable decorator that comes with the library). We also want to skip resolving if we don't have a selectedUserId so we will use the shouldSkip and connect it with a binding that has the same name as our directive *(inside the resolver: `@Input('appUserPostsResolver') shouldSkip;` / inside the html: `[appUserPostsResolver]="!selectedUserId"`)*. shouldSkip will make the resolve container skip calling resolve on this resolver but that means that we will have to individually call the resolve whenever the shouldSkip changes. We could of course use a setter for the shouldSkip and call resolve within if the value is true if we want ot resolve whenever the selectedUserId is present or we can use the config property that the library provides. 
Config Options:

  ⚠️ Using a config other than ResolverConfig.Default will disconnect the resolver resolve from the container but the container will track the state of the resolver.

  * ResolverConfig.Default - don't auto resolve when skip or a depenency changes/emits.
  * ResolverConfig.AutoResolve - auto resolve when skip or a depenency changes/emits.
  * ResolverConfig.AutoResolveOnce - auto resolve once when skip or a depenency changes/emits (look at the scenarios bellow if you wonder when you should use this).

  ⚠️Scenario for ResolverConfig.AutoResolveOnce:
   * if shouldSkip = true
     the resolver will be skiped until the shouldSkip is set to false. When that happens a resolve will be triggered but it won't trigger of future shouldSkip changes.

**In this example we will use `ResolverConfig.AutoResolve` that means that every time the dependencies () change a resolve will be triggered.**


*user-posts.resolver.ts*
```typescript 
import { Directive, Input } from '@angular/core';
import { Resolver, HG_RESOLVERS, ResolverConfig, toObservable } from 'hg-resolvers';
import { PostService } from '../post.service';
import { Observable } from 'rxjs';

@Directive({
  selector: '[appUserPostsResolver]',
  providers: [
    {
      provide: HG_RESOLVERS,
      multi: true,
      useExisting: UserPostsResolverDirective
    }
  ],
  exportAs: 'appUserPostsResolver'
}) export class UserPostsResolverDirective extends Resolver<any[]> {

  // skip resolve until shouldSkip is falsy
  @Input('appUserPostsResolver') shouldSkip;

  // auto resolve when dependencies change
  config = ResolverConfig.AutoResolve;

  // input dependency converted to a stream
  @Input() @toObservable selectedUserId: Observable<number>;

  constructor(postService: PostService) {
    // the resolve function now accepts an array with the dependency values
    // and the second argument is a function that returns an observable from all the dependencies
    super(([id]: [number]) => postService.loadUserPosts(id), () => this.selectedUserId);
  }
}

```

*some.component.html*
```html
<ng-template #loader let-showLoading>
  <div *ngIf="showLoading">Loading...</div>
</ng-template>
<ng-template #error let-isErrored let-errors="errors">
  <div *ngIf="isErrored">{{errors | json}}</div>
</ng-template>

<button (click)="resolve.refresh$.next()">Re-Fetch All</button>
<input type="number" #idInput><button (click)="selectedUserId = idInput.value">Select</button>
Don't forget to set AutoResolve on userPostsResolver because otherwise you have to call it explicitly
<!-- resolveOnInit has a default value of true so you don't need to have if in this case -->
<hg-resolve #resolve="hgResolve" appUserListResolver [appUserPostsResolver]="!selectedUserId"
  [selectedUserId]="selectedUserId" #userListResolver="appUserListResolver" #userPostsResolver="appUserPostsResolver"
  [loaderTemplateRef]="loader" [errorTemplateRef]="error" [resolveOnInit]="true">
  <h2>Users</h2>
  {{userListResolver.data$ | async | json}}
  <ng-container *ngIf="userPostsResolver.data$ | async as userPosts">
    <h2>User Posts</h2>
    {{userPosts | json }}
  </ng-container>
</hg-resolve>
```


### 5. Remotely attaching resolvers

Sometimes we want to attach a resolver to a container remotely/dynamically. We can use the [resolveAttach] directive

*some.component.html*
```html
<ng-template #loader let-showLoading>
  <div *ngIf="showLoading">Loading...</div>
</ng-template>
<ng-template #error let-isErrored let-errors="errors">
  <div *ngIf="isErrored">{{errors | json}}</div>
</ng-template>

<button (click)="resolve.refresh$.next()">Re-Fetch All</button>
<input type="number" #idInput><button (click)="selectedUserId = idInput.value">Select</button>
Don't forget to set AutoResolve on userPostsResolver because otherwise you have to call it explicitly
<!-- resolveOnInit has a default value of true so you don't need to have if in this case -->
<hg-resolve #resolve="hgResolve" appUserListResolver #userListResolver="appUserListResolver"
  [loaderTemplateRef]="loader" [errorTemplateRef]="error" [resolveOnInit]="true">
  <h2>Users</h2>
  {{userListResolver.data$ | async | json}}

  You can use this for attaching directives dynamically based on ngIf / ngSwitch / ngFor

  <ng-container hgResolveAttach [appUserPostsResolver]="!selectedUserId" [selectedUserId]="selectedUserId"
    #userPostsResolver="appUserPostsResolver">
    <ng-container *ngIf="userPostsResolver.data$ | async as userPosts">
      <h2>User Posts</h2>
      {{userPosts | json }}
    </ng-container>
  </ng-container>
</hg-resolve>
```

### 6. Multiple instance of the same resolver attached to the same resolve container.

In some cases we might have diffrent sections of the page that might be present at the same time or might not but depend on the same data. In this case we don't want to be making the same request multiple times. By default multiple instances of the same resolver are connected witheachother and only one request is sent instead of multiple. In the case when you don't want this connection you can set the `disconnectDifferentInstances` property to true.

*user-posts.resolver.ts*
```typescript 
import { Directive, Input } from '@angular/core';
import { Resolver, HG_RESOLVERS, ResolverConfig, toObservable } from 'hg-resolvers';
import { PostService } from '../post.service';
import { Observable } from 'rxjs';

@Directive({
  selector: '[appUserPostsResolver]',
  providers: [
    {
      provide: HG_RESOLVERS,
      multi: true,
      useExisting: UserPostsResolverDirective
    }
  ],
  exportAs: 'appUserPostsResolver'
}) export class UserPostsResolverDirective extends Resolver<any[]> {

  @Input('appUserPostsResolver') shouldSkip;

  config = ResolverConfig.AutoResolve;

  @Input() @toObservable selectedUserId: Observable<number>;

  // Two instance of the same resolver attached to the same resolve container by default work like only one resolver exists. 
  // In a case where you don't want the default behaviour and you want the resolvers to be disconnected from eachother you can set 
  // this property to true!
  disconnectDifferentInstances = false;

  constructor(postService: PostService) {
    super(([id]: [number]) => postService.loadUserPosts(id), () => this.selectedUserId);
  }
}

```

#### For a more complex example please check the [demo app](https://stackblitz.com/github/IliaIdakiev/hg-resolvers)

## Error Handling

Each resolver has an error property that will contain the error if one exists. You can use this property inside your templates via template reference variable containing the resolver instance to present the error message/code to the user. 

Each resolve container has a errors property containing all the errors from the connected resolver directives


**ALL CONTRIBUTIONS ARE VERY WELCOME!**

TODO:
* Unit testing
* Resolver schematic

[Check our website](https://hillgrand.com/);