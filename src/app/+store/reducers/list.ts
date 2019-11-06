import { createReducer, on, ActionReducerMap } from '@ngrx/store';
import { loadUsers, loadUsersSuccess, loadUserPostsSuccess, loadUserPosts, loadUserPostSuccess } from '../actions/list';

export interface IUserListState { users: any[]; posts: any[]; post: any; }
const initialState: IUserListState = { users: null, posts: null, post: null };

export const userListReducer = createReducer<IUserListState>(
  initialState,
  on(loadUsers, state => ({ ...state, users: null })),
  on(loadUserPosts, state => ({ ...state, posts: null })),
  on(loadUserPosts, state => ({ ...state, post: null })),
  on(loadUsersSuccess, (state, { payload: { users } }) => ({ ...state, users })),
  on(loadUserPostsSuccess, (state, { payload: { posts } }) => ({ ...state, posts })),
  on(loadUserPostSuccess, (state, { payload: { post } }) => ({ ...state, post }))
);
