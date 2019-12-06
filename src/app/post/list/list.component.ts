import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { PostsListResolverDirective } from '../-resolvers/list.resolver';
import { PostUserResolverDirective } from '../-resolvers/post-user.resolver';
import { AsyncRenderComponent } from 'hg-async-render';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent  {

  @ViewChildren(AsyncRenderComponent) asyncRenderComponents: QueryList<AsyncRenderComponent>;

  @ViewChild(PostsListResolverDirective, { static: true }) postsListResolver: PostsListResolverDirective;
  @ViewChild(PostUserResolverDirective, { static: true }) postUserResolver: PostUserResolverDirective;

  selectedPost = null;
  displayedColumns = ['title'];

  constructor() { }

  select(row) {
    if (this.selectedPost === row) { this.selectedPost = null; return; }
    this.selectedPost = row;
  }

  reloadPostsList() {
    this.postsListResolver.resolve();
    // or this.asyncRenderComponents.first.refresh$.next();
    const a = this.postsListResolver;
    console.log(a);
  }

  reloadPostUser() {
    this.asyncRenderComponents.last.refresh$.next();
    // or this.postUserResolver.resolve();
  }

  reloadAll() {
    this.asyncRenderComponents.map(ar => ar.resolve());
  }
}
