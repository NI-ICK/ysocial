import { createFeatureSelector, createSelector } from '@ngrx/store'
import { commentsAdapter, CommentsState } from './comments.state'
import { Comment } from '../../utils/interfaces/comment.interface'

export const selectCommentsState =
  createFeatureSelector<CommentsState>('comments')

export const { selectAll, selectEntities } =
  commentsAdapter.getSelectors(selectCommentsState)

export const selectCommentsForPost = (postId: string) =>
  createSelector(selectCommentsState, (state) => {
    const ids = state.postComments[postId] || []

    return ids
      .map((id) => state.entities[id])
      .filter((c): c is Comment => c !== undefined)
  })

export const selectRepliesForComment = (parentId: string) =>
  createSelector(selectCommentsState, (state) => {
    const ids = state.replies[parentId] || []

    return ids
      .map((id) => state.entities[id])
      .filter((c): c is Comment => c !== undefined)
  })

export const selectIsLiking = createSelector(
  selectCommentsState,
  (state) => state.likingComment
)

export const selectIsLikingComment = (id: string) =>
  createSelector(selectIsLiking, (liking) => liking[id])
