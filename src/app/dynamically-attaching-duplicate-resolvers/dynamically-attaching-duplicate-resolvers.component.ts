import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dynamically-attaching-duplicate-resolvers',
  templateUrl: './dynamically-attaching-duplicate-resolvers.component.html',
  styleUrls: ['./dynamically-attaching-duplicate-resolvers.component.scss']
})
export class DynamicallyAttachingDuplicateResolversComponent implements OnInit {

  selectedUserId = null;

  displayedColumns = ['username', 'email', 'name'];
  postsDisplayedColumns = ['userId', 'title'];

  showUserPostsCount = true;
  showUserPosts = true;

  constructor() { }

  ngOnInit() {
  }

  rowClickHandler(user: any) {
    if (this.selectedUserId === user.id) { this.selectedUserId = null; return; }
    this.selectedUserId = user.id;
  }

  toggleUsersPostsCount() {
    this.showUserPostsCount = !this.showUserPostsCount;
  }

  toggleUsersPosts() {
    this.showUserPosts = !this.showUserPosts;
  }
}
