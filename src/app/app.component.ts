import { Component } from '@angular/core';
import { UserListModel } from './+store/models/list';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  users$ = this.userListModel.users$;
  posts$ = this.userListModel.posts$;
  post$ = this.userListModel.post$;
  skip = true;
  constructor(private userListModel: UserListModel) { }
}
