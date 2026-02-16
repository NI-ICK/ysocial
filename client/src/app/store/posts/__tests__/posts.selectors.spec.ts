import { Post } from '../../../utils/post.interface'
import { postsAdapter, PostsState } from '../posts.state'
import * as PostsSelectors from '../posts.selectors'

describe('Posts Selectors', () => {
  const mockPosts = [
    { id: '1', body: 'test' } as Post,
    { id: '2', body: 'test' } as Post,
  ]

  const mockState: PostsState = postsAdapter.setAll(mockPosts, {
    ids: [],
    entities: {},
    loading: false,
    error: null,
  })
  const appState = { posts: mockState }

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
      loading: true,
    }

    const result = PostsSelectors.selectPostsLoading({ posts: loadingState })

    expect(result).toEqual(true)
  })
})
