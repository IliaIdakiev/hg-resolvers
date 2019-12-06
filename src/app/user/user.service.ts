import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUser, IPost } from '../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  loadUsers = () => {
    return this.http.get<IUser[]>('https://jsonplaceholder.typicode.com/users');
  }

  loadUserPosts = ([userId]: [number]) => {
    return this.http.get<IPost[]>(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
  }
}
