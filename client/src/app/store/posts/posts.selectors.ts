import { createFeatureSelector, createSelector } from '@ngrx/store'
import { postsAdapter, PostsState } from './posts.state'
import { Post } from '../../utils/post.interface'

export const selectPostsState = createFeatureSelector<PostsState>('posts')

export const { selectAll, selectEntities } =
  postsAdapter.getSelectors(selectPostsState)

export const selectAllPosts = selectAll

export const selectPostsLoading = createSelector(
  selectPostsState,
  (state) => state.postsLoading
)

export const selectCurrentPostId = createSelector(
  selectPostsState,
  (state) => state.currentPostId
)

export const selectCurrentPost = createSelector(
  selectEntities,
  selectCurrentPostId,
  (entities, id): Post | null => (id ? entities[id] ?? null : null)
)

export const selectPostById = (id: string) =>
  createSelector(selectEntities, (entities) => entities[id])
