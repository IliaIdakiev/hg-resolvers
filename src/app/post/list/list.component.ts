import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { PostsListResolverDirective } from '../-resolvers/list.resolver';
import { PostUserResolverDirective } from '../-resolvers/post-user.resolver';
import { ResolveComponent } from 'hg-resolvers';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {

  hello = false;

  @ViewChildren(ResolveComponent) asyncRenderComponents: QueryList<ResolveComponent>;

  @ViewChild(PostsListResolverDirective, { static: true }) postsListResolver: PostsListResolverDirective;
  @ViewChild(PostUserResolverDirective, { static: true }) postUserResolver: PostUserResolverDirective;

  noAttach = false;
  selectedPost = null;
  displayedColumns = ['title'];

  constructor() {
  }

  select(row) {
    if (this.selectedPost === row) { this.selectedPost = null; return; }
    this.selectedPost = row;

    setTimeout(() => {
      this.hello = true;
    }, 5000);
  }

  reloadPostsList() {
    this.postsListResolver.resolve();
    // or this.asyncRenderComponents.first.refresh$.next();
  }

  reloadPostUser() {
    this.asyncRenderComponents.last.refresh$.next();
    // or this.postUserResolver.resolve();
  }

  reloadAll() {
    this.asyncRenderComponents.map(ar => ar.resolve());
  }
}
