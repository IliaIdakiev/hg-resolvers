import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dynamically-attaching-resolvers',
  templateUrl: './dynamically-attaching-resolvers.component.html',
  styleUrls: ['./dynamically-attaching-resolvers.component.scss']
})
export class DynamicallyAttachingResolversComponent implements OnInit {

  selectedUserId = null;

  displayedColumns = ['username', 'email', 'name'];
  postsDisplayedColumns = ['userId', 'title'];

  constructor() { }

  ngOnInit() {
  }

  rowClickHandler(user: any) {
    if (this.selectedUserId === user.id) { this.selectedUserId = null; return; }
    this.selectedUserId = user.id;
  }
}
