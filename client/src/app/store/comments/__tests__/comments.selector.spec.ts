import { Comment } from '../../../utils/interfaces/comment.interface'
import { commentsAdapter, CommentsState } from '../comments.state'
import * as CommentsSelectors from '../comments.selectors'

describe('Comments Selectors', () => {
  const mockComments = [
    { id: '1', body: 'test' } as Comment,
    { id: '2', body: 'test2' } as Comment,
  ]

  const mockReplies = [
    { id: '3', body: 'test3' } as Comment,
    { id: '4', body: 'test4' } as Comment,
  ]

  const mockState: CommentsState = {
    ...commentsAdapter.setAll(
      [...mockComments, ...mockReplies],
      commentsAdapter.getInitialState()
    ),
    postComments: { '123': ['1', '2'] },
    replies: { '1': ['3', '4'] },
    loadingRootComments: {},
    loadingReplies: {},
    likingComment: { '5': true },
    error: null,
  }
  const appState = { comments: mockState }

  it('should select comments feature state', () => {
    const result = CommentsSelectors.selectCommentsState(appState)

    expect(result).toEqual(mockState)
  })

  it('should select comments for post', () => {
    const result = CommentsSelectors.selectCommentsForPost('123')(appState)

    expect(result).toEqual(mockComments)
  })

  it('should select replies for comment', () => {
    const result = CommentsSelectors.selectRepliesForComment('1')(appState)

    expect(result).toEqual(mockReplies)
  })

  it('should select isLiking field', () => {
    const result = CommentsSelectors.selectIsLiking(appState)

    expect(result).toEqual({ '5': true })
  })

  it('should select is isLiking for a comment', () => {
    const result = CommentsSelectors.selectIsLikingComment('5')(appState)

    expect(result).toEqual(true)
  })
})
