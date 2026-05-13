import { createFeatureSelector, createSelector } from '@ngrx/store'
import { postsAdapter, PostsState } from './posts.state'
import { Post } from '../../utils/interfaces/post.interface'
import { selectCurrentUser } from '../auth/auth.selectors'
import { selectUsersState } from '../users/users.selectors'

export const selectPostsState = createFeatureSelector<PostsState>('posts')

export const { selectAll, selectEntities } =
  postsAdapter.getSelectors(selectPostsState)

export const selectAllPosts = createSelector(
  selectAll,
  selectCurrentUser,
  (posts, currentUser) => {
    return posts.map((post) => ({
      ...post,
      likedByMe: !!currentUser && post.likedByMe,
    }))
  }
)

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
  selectCurrentUser,
  (entities, id, currentUser): Post | null => {
    if (!id) return null

    const post = entities[id]
    if (!post) return null

    return {
      ...post,
      likedByMe: !!currentUser && post.likedByMe,
    }
  }
)

export const selectPostById = (id: string) =>
  createSelector(selectEntities, (entities) => entities[id])

export const selectIsLiking = createSelector(
  selectPostsState,
  (state) => state.likingPost
)

export const selectIsLikingPost = (id: string) =>
  createSelector(selectIsLiking, (liking) => liking[id])

export const selectCreatedPosts = createSelector(
  selectEntities,
  selectUsersState,
  (entities, users) =>
    users.createdPosts
      .map((id) => entities[id])
      .filter((post): post is Post => !!post)
)

export const selectLikedPosts = createSelector(
  selectEntities,
  selectUsersState,
  (entities, users) =>
    users.likedPosts
      .map((id) => entities[id])
      .filter((post): post is Post => !!post)
)

export const selectNoMorePosts = createSelector(
  selectPostsState,
  (state) => state.noMorePosts
)
