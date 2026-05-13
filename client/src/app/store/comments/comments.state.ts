import { createEntityAdapter, EntityState } from '@ngrx/entity'
import { Comment } from '../../utils/interfaces/comment.interface'

export interface CommentsState extends EntityState<Comment> {
  postComments: Record<string, string[]>
  replies: Record<string, string[]>
  loadingRootComments: boolean
  loadingReplies: boolean
  likingComment: Record<string, boolean>
  error: string | null
}

export const commentsAdapter = createEntityAdapter<Comment>()

export const initialState: CommentsState = commentsAdapter.getInitialState({
  postComments: {},
  replies: {},
  loadingRootComments: false,
  loadingReplies: false,
  likingComment: {},
  error: null,
})
