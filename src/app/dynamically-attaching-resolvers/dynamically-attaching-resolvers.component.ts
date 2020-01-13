import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dynamically-attaching-resolvers',
  templateUrl: './dynamically-attaching-resolvers.component.html',
  styleUrls: ['./dynamically-attaching-resolvers.component.scss']
})
export class DynamicallyAttachingResolversComponent implements OnInit {

  selectedUserId = null;

  constructor() { }

  ngOnInit() {
  }

}
