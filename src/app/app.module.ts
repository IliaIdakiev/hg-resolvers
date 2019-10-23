import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoaderComponent } from './loader/loader.component';
import { UserListAsyncResolverDirective } from './-resolvers/user-list';
import { UserPostListResolverDirective } from './-resolvers/user-post-list';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { reducers } from './+store/reducers';
import { EffectsModule } from '@ngrx/effects';
import { UserListEffects } from './+store/effects/list';
import { AsyncRenderModule } from 'hg-async-render';

@NgModule({
  declarations: [
    AppComponent,
    LoaderComponent,
    UserListAsyncResolverDirective,
    UserPostListResolverDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AsyncRenderModule,
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([UserListEffects]),
    StoreDevtoolsModule.instrument(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
