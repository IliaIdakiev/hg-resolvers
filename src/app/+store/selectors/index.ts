import { createFeatureSelector, createSelector } from '@ngrx/store';
import { getPosts, getUsers } from './list';
import { IUserListState } from '../reducers/list';

const getListState = createFeatureSelector<IUserListState>('list');

export const getUserListStatePosts = createSelector(getListState, getPosts);
export const getUserListStateUsers = createSelector(getListState, getUsers);

