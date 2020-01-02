import { Component, OnInit, ViewChild } from '@angular/core';
import { UserListResolverDirective } from '../-resolvers/list.resover';
import { UserPostsResolverDirective } from '../-resolvers/user-posts.resolver';
import { ResolveDirective } from 'hg-resolvers';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  displayedColumns = ['email', 'name'];
  displayedPostsColumns = ['title'];
  selectedElementId = null;

  @ViewChild(UserListResolverDirective, { static: true }) userListResolver: UserListResolverDirective;
  @ViewChild(UserPostsResolverDirective, { static: true }) userPostsResolver: UserPostsResolverDirective;
  @ViewChild(ResolveDirective, { static: true }) asyncRender: ResolveDirective;

  constructor() { }

  ngOnInit() {
  }

  select(element: any) {
    if (this.selectedElementId === element.id) { this.selectedElementId = null; return; }
    this.selectedElementId = element.id;
  }

  reloadUserList() {
    this.userListResolver.resolve();
  }

  reloadUserPosts() {
    this.userPostsResolver.resolve();
  }

  reloadAll() {
    this.asyncRender.refresh$.next();
  }
}
