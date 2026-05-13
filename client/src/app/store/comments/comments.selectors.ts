import { createFeatureSelector, createSelector } from '@ngrx/store'
import { commentsAdapter, CommentsState } from './comments.state'
import { Comment } from '../../utils/interfaces/comment.interface'
import { selectCurrentUser } from '../auth/auth.selectors'

export const selectCommentsState =
  createFeatureSelector<CommentsState>('comments')

export const { selectAll, selectEntities } =
  commentsAdapter.getSelectors(selectCommentsState)

export const selectCommentsForPost = (postId: string) =>
  createSelector(
    selectCommentsState,
    selectCurrentUser,
    (state, currentUser) => {
      const ids = state.postComments[postId] || []

      return ids
        .map((id) => ({
          ...state.entities[id],
          likedByMe: !!currentUser && state.entities[id]?.likedByMe,
        }))
        .filter((c): c is Comment => c !== undefined)
    }
  )

export const selectRepliesForComment = (parentId: string) =>
  createSelector(
    selectCommentsState,
    selectCurrentUser,
    (state, currentUser) => {
      const ids = state.replies[parentId] || []

      return ids
        .map((id) => ({
          ...state.entities[id],
          likedByMe: !!currentUser && state.entities[id]?.likedByMe,
        }))
        .filter((c): c is Comment => c !== undefined)
    }
  )

export const selectIsLiking = createSelector(
  selectCommentsState,
  (state) => state.likingComment
)

export const selectLoadingComments = createSelector(
  selectCommentsState,
  (state) => state.loadingRootComments
)

export const selectIsLikingComment = (id: string) =>
  createSelector(selectIsLiking, (liking) => liking[id])
