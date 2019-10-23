import { IUserListState } from '../reducers/list';

export const getUsers = (state: IUserListState) => state.users;
export const getPosts = (state: IUserListState) => state.posts;
