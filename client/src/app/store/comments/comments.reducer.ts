import { createReducer, on } from '@ngrx/store'
import { commentsAdapter, initialState } from './comments.state'
import * as CommentsActions from './comments.actions'
import { postsAdapter } from '../posts/posts.state'

const updateComments = (
  comments: Record<string, string[]>,
  tmpId: string,
  realId: string
) => {
  const newState = { ...comments }

  for (const postId in newState) {
    const ids = newState[postId]

    if (ids.includes(tmpId)) {
      newState[postId] = ids.map((id) => (id === tmpId ? realId : id))
    }
  }

  return newState
}

export const commentsReducer = createReducer(
  initialState,
  on(CommentsActions.loadCommentsSuccess, (state, { comments, postId }) => {
    const updatedState = commentsAdapter.upsertMany(comments, state)

    const rootComments = comments.filter((c) => !c.parent)
    const replies = comments.filter((c) => c.parent)

    const repliesMap: Record<string, string[]> = {}

    for (const reply of replies) {
      const parentId = reply.parent!.id

      if (!repliesMap[parentId]) repliesMap[parentId] = []

      repliesMap[parentId].push(reply.id)
    }

    return {
      ...updatedState,
      postComments: {
        ...updatedState.postComments,
        [postId]: rootComments.map((c) => c.id),
      },
      replies: repliesMap,
    }
  }),
  on(
    CommentsActions.createCommentSuccess,
    (state, { comment, postId, parentId }) => {
      let updatedState = commentsAdapter.addOne(comment, state)

      const isReply = parentId

      if (isReply) {
        const existingIds = updatedState.replies[parentId] || []

        updatedState = {
          ...updatedState,
          replies: {
            ...updatedState.replies,
            [parentId]: [comment.id, ...existingIds],
          },
        }

        const parent = updatedState.entities[parentId]
        if (parent) {
          updatedState = commentsAdapter.updateOne(
            {
              id: parentId,
              changes: { repliesCount: (parent.repliesCount || 0) + 1 },
            },
            updatedState
          )
        }

        return updatedState
      } else {
        const existingIds = updatedState.postComments[postId] || []

        return {
          ...updatedState,
          postComments: {
            ...updatedState.postComments,
            [postId]: [comment.id, ...existingIds],
          },
        }
      }
    }
  ),
  on(
    CommentsActions.replaceOptimisticComment,
    (state, { tmpId, comment, parentId }) => {
      const stateWithoutTmp = commentsAdapter.removeOne(tmpId, state)

      const updatedState = commentsAdapter.addOne(comment, stateWithoutTmp)

      const isReply = parentId

      if (isReply) {
        return {
          ...updatedState,
          replies: updateComments(state.replies, tmpId, comment.id),
        }
      } else {
        return {
          ...updatedState,
          postComments: updateComments(state.postComments, tmpId, comment.id),
        }
      }
    }
  ),
  on(
    CommentsActions.removeOptimisticComment,
    (state, { tmpId, parentId, postId }) => {
      const updatedState = commentsAdapter.removeOne(tmpId, state)

      const isReply = parentId

      if (isReply) {
        return {
          ...updatedState,
          replies: {
            ...updatedState.replies,
            [parentId]: updatedState.replies[parentId].filter(
              (id) => id !== tmpId
            ),
          },
        }
      } else {
        return {
          ...updatedState,
          postComments: {
            ...updatedState.postComments,
            [postId]: updatedState.postComments[postId].filter(
              (id) => id !== tmpId
            ),
          },
        }
      }
    }
  ),
  on(CommentsActions.toggleCommentLike, (state, { commentId }) => {
    const comment = state.entities[commentId]

    if (!comment) return state

    const likedByMe = !comment.likedByMe

    const updatedState = commentsAdapter.updateOne(
      {
        id: commentId,
        changes: {
          likedByMe,
          likesCount: likedByMe
            ? comment.likesCount + 1
            : Math.max(0, comment.likesCount - 1),
        },
      },
      state
    )

    return {
      ...updatedState,
      likingComment: { ...updatedState.likingComment, [commentId]: true },
    }
  }),
  on(CommentsActions.toggleCommentLikeSuccess, (state, { commentId }) => {
    const { [commentId]: _, ...rest } = state.likingComment

    return { ...state, likingComment: rest }
  })
)
