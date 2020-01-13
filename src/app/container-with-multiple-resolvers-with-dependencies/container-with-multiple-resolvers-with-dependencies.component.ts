import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-container-with-multiple-resolvers-with-dependencies',
  templateUrl: './container-with-multiple-resolvers-with-dependencies.component.html',
  styleUrls: ['./container-with-multiple-resolvers-with-dependencies.component.scss']
})
export class ContainerWithMultipleResolversWithDependenciesComponent implements OnInit {

  selectedUserId = null;

  constructor() { }

  ngOnInit() {
  }

}
