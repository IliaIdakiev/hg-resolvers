import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import {
  loadUsersSuccess,
  loadUsersFailure,
  loadUsers,
  loadUserPostsCancel,
  loadUsersCancel,
  loadUserPostsSuccess,
  loadUserPostsFailure,
  loadUserPosts
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

  constructor(private actions$: Actions, private userService: UserService) { }
}
