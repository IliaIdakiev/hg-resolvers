import { createReducer, on, ActionReducerMap } from '@ngrx/store';
import { loadUsers, loadUsersSuccess, loadUserPostsSuccess, loadUserPosts } from '../actions/list';

export interface IUserListState { users: any[]; posts: any[]; }
const initialState: IUserListState = { users: null, posts: null };

export const userListReducer = createReducer<IUserListState>(
  initialState,
  on(loadUsers, state => ({ ...state, users: null })),
  on(loadUserPosts, state => ({ ...state, posts: null })),
  on(loadUsersSuccess, (state, { payload: { users } }) => ({ ...state, users })),
  on(loadUserPostsSuccess, (state, { payload: { posts } }) => ({ ...state, posts }))
);
