import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPost, IUser } from '../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http: HttpClient) { }

  loadPosts = () => {
    return this.http.get<IPost[]>('https://jsonplaceholder.typicode.com/posts');
  }

  loadPostUser = ([userId]: [number]) => {
    return this.http.get<IUser>('https://jsonplaceholder.typicode.com/users/' + userId);
  }
}
