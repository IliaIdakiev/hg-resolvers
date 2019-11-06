import { IUserListState } from '../reducers/list';

export const getUsers = (state: IUserListState) => state.users;
export const getPosts = (state: IUserListState) => state.posts;
export const getPost = (state: IUserListState) => state.post;
