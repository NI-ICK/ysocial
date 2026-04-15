import { createAction, props } from '@ngrx/store'
import { Comment } from '../../utils/interfaces/comment.interface'

// ----- Load Comments -----
export const loadComments = createAction(
  '[Comments] Load Comments',
  props<{ postId: string }>()
)
export const loadCommentsSuccess = createAction(
  '[Comments] Load Comments Success',
  props<{ postId: string; comments: Comment[] }>()
)
export const loadCommentsFailure = createAction(
  '[Comments] Load Comments Failure',
  props<{ error: string }>()
)

// ----- Create Comment -----
export const createComment = createAction(
  '[Comments] Create Comment',
  props<{ body: string; postId: string; parentId: string | null }>()
)
export const createCommentSuccess = createAction(
  '[Comments] Create Comment Success',
  props<{ comment: Comment; postId: string; parentId: string | null }>()
)
export const createCommentFailure = createAction(
  '[Comments] Create Comment Failure',
  props<{ error: string }>()
)
export const replaceOptimisticComment = createAction(
  '[Comments] Replace Optimistic Comment',
  props<{ tmpId: string; comment: Comment; parentId: string | null }>()
)
export const removeOptimisticComment = createAction(
  '[Comments] Remove Optimistic Comment',
  props<{ tmpId: string; parentId: string | null; postId: string }>()
)

// ----- Toggle Comment Like -----
export const toggleCommentLike = createAction(
  '[Comments] Toggle Comment Like',
  props<{ commentId: string }>()
)
export const toggleCommentLikeSuccess = createAction(
  '[Comments] Toggle Comment Like Success',
  props<{ commentId: string }>()
)
export const toggleCommentLikeFailure = createAction(
  '[Comments] Toggle Comment Like Failure',
  props<{ error: string }>()
)
