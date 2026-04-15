import { createEntityAdapter, EntityState } from '@ngrx/entity'
import { Comment } from '../../utils/interfaces/comment.interface'

export interface CommentsState extends EntityState<Comment> {
  postComments: Record<string, string[]>
  replies: Record<string, string[]>
  loadingRootComments: Record<string, string[]>
  loadingReplies: Record<string, string[]>
  likingComment: Record<string, boolean>
  error: string | null
}

export const commentsAdapter = createEntityAdapter<Comment>()

export const initialState: CommentsState = commentsAdapter.getInitialState({
  postComments: {},
  replies: {},
  loadingRootComments: {},
  loadingReplies: {},
  likingComment: {},
  error: null,
})
