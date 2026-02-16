import { createFeatureSelector, createSelector } from '@ngrx/store'
import { postsAdapter, PostsState } from './posts.state'

export const selectPostsState = createFeatureSelector<PostsState>('posts')

const { selectAll } = postsAdapter.getSelectors()

export const selectAllPosts = createSelector(selectPostsState, selectAll)

export const selectPostsLoading = createSelector(
  selectPostsState,
  (state) => state.loading
)
