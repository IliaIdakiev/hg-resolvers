import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType, act } from '@ngrx/effects';
import {
  loadUsersSuccess,
  loadUsersFailure,
  loadUsers,
  loadUserPostsCancel,
  loadUsersCancel,
  loadUserPostsSuccess,
  loadUserPostsFailure,
  loadUserPosts,
  loadUserPost,
  loadUserPostFailure,
  loadUserPostSuccess,
  loadUserPostCancel
} from '../actions/list';
import { UserService } from '../../user.service';
import { switchMap, map, catchError, takeUntil } from 'rxjs/operators';

@Injectable()
export class UserListEffects {
  loadUsers$ = createEffect(() => this.actions$.pipe(
    ofType(loadUsers),
    switchMap(() => this.userService.loadUsers().pipe(
      takeUntil(this.actions$.pipe(ofType(loadUsersCancel))),
      map(users => loadUsersSuccess(users as any)),
      catchError(error => [loadUsersFailure(error)]))
    )
  ));

  loadUserPosts$ = createEffect(() => this.actions$.pipe(
    ofType(loadUserPosts),
    switchMap(() => this.userService.loadPosts().pipe(
      takeUntil(this.actions$.pipe(ofType(loadUserPostsCancel))),
      map(posts => loadUserPostsSuccess(posts as any)),
      catchError(error => [loadUserPostsFailure(error)]))
    )
  ));

  loadUserPost$ = createEffect(() => this.actions$.pipe(
    ofType(loadUserPost),
    map(action => action.payload),
    switchMap(({ id }) => this.userService.loadPost(id).pipe(
      takeUntil(this.actions$.pipe(ofType(loadUserPostCancel))),
      map(post => loadUserPostSuccess(post as any)),
      catchError(error => [loadUserPostFailure(error)]))
    )
  ));

  constructor(private actions$: Actions, private userService: UserService) { }
}
