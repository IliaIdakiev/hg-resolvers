import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import { UserListAsyncResolverDirective } from './-resolvers/user-list';
// import { UserPostListResolverDirective } from './-resolvers/user-post-list';
// import { SimpleUserListAsyncResolverDirective } from './-resolvers/simple-user-list';
import { HttpClientModule } from '@angular/common/http';
// import { UserPostDepResolverDirective } from './-resolvers/user-post-dep';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    // SimpleUserListAsyncResolverDirective,
    // UserListAsyncResolverDirective,
    // UserPostListResolverDirective,
    // UserPostDepResolverDirective,
    HomeComponent
  ],
  imports: [
    CoreModule,
    SharedModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
