import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dynamically-attaching-duplicate-resolvers',
  templateUrl: './dynamically-attaching-duplicate-resolvers.component.html',
  styleUrls: ['./dynamically-attaching-duplicate-resolvers.component.scss']
})
export class DynamicallyAttachingDuplicateResolversComponent implements OnInit {

  selectedUserId = null;

  constructor() { }

  ngOnInit() {
  }

}
