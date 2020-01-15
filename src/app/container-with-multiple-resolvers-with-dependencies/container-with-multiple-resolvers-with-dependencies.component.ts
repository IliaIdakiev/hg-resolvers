import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-container-with-multiple-resolvers-with-dependencies',
  templateUrl: './container-with-multiple-resolvers-with-dependencies.component.html',
  styleUrls: ['./container-with-multiple-resolvers-with-dependencies.component.scss']
})
export class ContainerWithMultipleResolversWithDependenciesComponent implements OnInit {

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
