import { Comment } from '../../../utils/interfaces/comment.interface'
import { commentsReducer } from '../comments.reducer'
import { commentsAdapter, initialState } from '../comments.state'
import * as CommentsActions from '../comments.actions'

describe('Comments Reducer', () => {
  it('should return the initial state', () => {
    expect(commentsReducer(undefined, { type: 'unknown' })).toEqual(
      initialState
    )
  })

  describe('loadCommentsSuccess', () => {
    it('should populate postComments, replies and entities correctly', () => {
      const comments = [
        { id: '123', body: 'comment1' } as Comment,
        { id: '2', body: 'reply1', parent: { id: '123' } } as Comment,
      ]

      const action = CommentsActions.loadCommentsSuccess({
        comments,
        postId: 'post-1',
      })
      const state = commentsReducer(initialState, action)

      expect(state.postComments).toEqual({ 'post-1': ['123'] })
      expect(state.replies).toEqual({ '123': ['2'] })
      expect(state.entities['123']).toEqual(comments[0])
      expect(state.entities['2']).toEqual(comments[1])
      expect(state.ids).toEqual(['123', '2'])
    })

    it('should group multiple replies under same comment', () => {
      const replies = [
        { id: '1', body: 'rep1', parent: { id: '123' } } as Comment,
        { id: '2', body: 'rep2', parent: { id: '123' } } as Comment,
        { id: '3', body: 'rep3', parent: { id: '123' } } as Comment,
      ]

      const action = CommentsActions.loadCommentsSuccess({
        comments: replies,
        postId: '15',
      })
      const state = commentsReducer(initialState, action)

      expect(state.replies).toEqual({ '123': ['1', '2', '3'] })
    })
  })

  describe('createCommentSuccess', () => {
    it('should create a comment', () => {
      const comment = { id: '1', body: 'test' } as Comment

      const action = CommentsActions.createCommentSuccess({
        comment,
        postId: '123',
        parentId: null,
      })
      const state = commentsReducer(initialState, action)

      expect(state.postComments).toEqual({ '123': ['1'] })
      expect(state.ids).toEqual(['1'])
      expect(state.entities['1']).toEqual(comment)
    })

    it('should create a reply and update replies count for parent', () => {
      const parent = { id: '1', body: 'test2', repliesCount: 0 } as Comment
      const reply = { id: '2', body: 'test' } as Comment

      const state = commentsAdapter.addOne(parent, initialState)
      const action = CommentsActions.createCommentSuccess({
        comment: reply,
        postId: '123',
        parentId: '1',
      })
      const updatedState = commentsReducer(state, action)

      expect(updatedState.replies).toEqual({ '1': ['2'] })
      expect(updatedState.ids).toEqual(['1', '2'])
      expect(updatedState.entities['2']).toEqual(reply)
      expect(updatedState.entities['1']?.repliesCount).toEqual(1)
    })
  })

  describe('replaceOptimisticComment', () => {
    it('should replace optimistic reply', () => {
      const reply = { id: '1', body: 'test' } as Comment
      const tmpReply = { id: 'tmp-1', body: 'test' } as Comment

      const state = commentsAdapter.addOne(tmpReply, {
        ...initialState,
        replies: {
          '5': ['tmp-1'],
        },
      })
      const action = CommentsActions.replaceOptimisticComment({
        tmpId: 'tmp-1',
        comment: reply,
        parentId: '5',
      })
      const updatedState = commentsReducer(state, action)
      commentsAdapter.addOne(tmpReply, updatedState)

      const expectedState = commentsAdapter.updateOne(
        { id: '1', changes: reply },
        updatedState
      )

      expect(updatedState).toEqual(expectedState)
      expect(updatedState.replies).toEqual({ '5': ['1'] })
    })

    it('should replace optimistic comment', () => {
      const comment = { id: '1', body: 'test' } as Comment
      const tmpComment = { id: 'tmp-1', body: 'test' } as Comment

      const state = commentsAdapter.addOne(tmpComment, {
        ...initialState,
        postComments: {
          '5': ['tmp-1'],
        },
      })
      const action = CommentsActions.replaceOptimisticComment({
        tmpId: 'tmp-1',
        comment: comment,
        parentId: null,
      })
      const updatedState = commentsReducer(state, action)
      commentsAdapter.addOne(tmpComment, updatedState)

      const expectedState = commentsAdapter.updateOne(
        { id: '1', changes: comment },
        updatedState
      )

      expect(updatedState).toEqual(expectedState)
      expect(updatedState.postComments).toEqual({ '5': ['1'] })
    })
  })

  describe('removeOptimisticComment', () => {
    it('should remove optimistic reply', () => {
      const tmpReply = {
        id: 'tmp-1',
        body: 'test',
        parent: { id: '5' },
      } as Comment

      const reply = {
        id: '2',
        body: 'test',
        parent: { id: '5' },
      } as Comment

      const state = commentsAdapter.addMany([tmpReply, reply], {
        ...initialState,
        replies: {
          '5': ['tmp-1', '2'],
        },
      })
      const action = CommentsActions.removeOptimisticComment({
        tmpId: 'tmp-1',
        parentId: '5',
        postId: '10',
      })
      const updatedState = commentsReducer(state, action)

      const expectedState = commentsAdapter.removeOne('tmp-1', {
        ...state,
        replies: { '5': ['2'] },
      })

      expect(updatedState).toEqual(expectedState)
    })

    it('should remove optimistic comment', () => {
      const tmpComment = {
        id: 'tmp-1',
        body: 'test',
      } as Comment

      const comment = {
        id: '2',
        body: 'test',
      } as Comment

      const state = commentsAdapter.addMany([tmpComment, comment], {
        ...initialState,
        postComments: {
          '10': ['tmp-1', '2'],
        },
      })
      const action = CommentsActions.removeOptimisticComment({
        tmpId: 'tmp-1',
        parentId: null,
        postId: '10',
      })
      const updatedState = commentsReducer(state, action)

      const expectedState = commentsAdapter.removeOne('tmp-1', {
        ...state,
        postComments: { '10': ['2'] },
      })

      expect(updatedState).toEqual(expectedState)
    })
  })

  describe('toggleCommentLike', () => {
    it('should increase likes count, toggle likedByMe and and add comment id to likingComment map', () => {
      const comment = {
        id: '1',
        body: 'test',
        likesCount: 0,
        likedByMe: false,
      } as Comment

      const state = commentsAdapter.addOne(comment, initialState)
      const action = CommentsActions.toggleCommentLike({ commentId: '1' })
      const updatedState = commentsReducer(state, action)

      const expectedState = commentsAdapter.addOne(
        { ...comment, likedByMe: true, likesCount: 1 },
        { ...initialState, likingComment: { ['1']: true } }
      )

      expect(updatedState).toEqual(expectedState)
    })
  })

  describe('toggleCommentLikeSuccess', () => {
    it('should remove commentId from likingComment map', () => {
      const state = { ...initialState, likingComment: { '1': true, '2': true } }
      const action = CommentsActions.toggleCommentLikeSuccess({
        commentId: '1',
      })
      const updatedState = commentsReducer(state, action)

      const expectedState = { ...initialState, likingComment: { '2': true } }

      expect(updatedState).toEqual(expectedState)
    })
  })
})
