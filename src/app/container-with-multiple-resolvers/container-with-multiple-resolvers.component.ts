import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-container-with-multiple-resolvers',
  templateUrl: './container-with-multiple-resolvers.component.html',
  styleUrls: ['./container-with-multiple-resolvers.component.scss']
})
export class ContainerWithMultipleResolversComponent implements OnInit {

  displayedColumns = ['username', 'email', 'name'];
  postsDisplayedColumns = ['userId', 'title'];

  constructor() { }

  ngOnInit() {
  }

}
