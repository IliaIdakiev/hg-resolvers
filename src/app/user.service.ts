import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  loadUsers() {
    return this.http.get('https://jsonplaceholder.typicode.com/users');
  }

  loadPosts() {
    return this.http.get('https://jsonplaceholder.typicode.com/posts');
  }

  loadPost(id: number) {
    return this.http.get('https://jsonplaceholder.typicode.com/posts/' + id);
  }
}
