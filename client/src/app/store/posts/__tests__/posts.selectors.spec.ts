import { Post } from '../../../utils/interfaces/post.interface'
import { postsAdapter, PostsState } from '../posts.state'
import * as PostsSelectors from '../posts.selectors'

describe('Posts Selectors', () => {
  const mockPosts = [
    { id: '1', body: 'test', likedByMe: false } as Post,
    { id: '2', body: 'test', likedByMe: false } as Post,
  ]

  const mockState: PostsState = {
    ...postsAdapter.setAll(mockPosts, postsAdapter.getInitialState()),
    currentPostId: '1',
    postsLoading: false,
    noMorePosts: false,
    error: null,
    likingPost: { '1': true },
  }
  const appState = { posts: mockState, auth: { user: null } }

  it('should select posts feature state', () => {
    const result = PostsSelectors.selectPostsState(appState)

    expect(result).toEqual(mockState)
  })

  it('should select all posts', () => {
    const result = PostsSelectors.selectAllPosts(appState)

    expect(result).toEqual(mockPosts)
  })

  it('should select loading state', () => {
    const loadingState = {
      ...mockState,
      postsLoading: true,
    }

    const result = PostsSelectors.selectPostsLoading({ posts: loadingState })

    expect(result).toEqual(true)
  })

  it('should select current post', () => {
    const result = PostsSelectors.selectCurrentPost(appState)

    expect(result).toEqual(mockPosts[0])
  })

  it('should select current post id', () => {
    const result = PostsSelectors.selectCurrentPostId(appState)

    expect(result).toEqual('1')
  })

  it('should select post by id', () => {
    const result = PostsSelectors.selectPostById('1')(appState)

    expect(result).toEqual(mockPosts[0])
  })

  it('should select likingPost', () => {
    const result = PostsSelectors.selectIsLiking(appState)

    expect(result).toEqual({ '1': true })
  })

  it('should select likingPost for a specific post', () => {
    const result = PostsSelectors.selectIsLikingPost('1')(appState)

    expect(result).toEqual(true)
  })

  it('should select noMorePosts', () => {
    const result = PostsSelectors.selectNoMorePosts(appState)

    expect(result).toEqual(false)
  })
})
