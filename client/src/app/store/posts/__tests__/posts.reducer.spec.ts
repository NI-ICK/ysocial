import { Post } from '../../../utils/post.interface'
import { postsReducer } from '../posts.reducer'
import { initialState, postsAdapter } from '../posts.state'
import * as PostsActions from '../posts.actions'

describe('Posts Reducer', () => {
  const mockPosts = [
    { id: '1', body: 'test', createdAt: new Date() } as Post,
    { id: '2', body: 'test', createdAt: new Date() } as Post,
  ]
  const mockPost = {
    id: '3',
    body: 'test',
    image: null,
  } as Post

  it('should return the initial state', () => {
    expect(postsReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  describe('loadPosts', () => {
    it('should set loading to true on loadPosts', () => {
      const state = postsReducer(initialState, PostsActions.loadPosts())

      expect(state.loading).toEqual(true)
    })

    it('should populate posts on loadPostsSuccess', () => {
      const state = postsReducer(
        initialState,
        PostsActions.loadPostsSuccess({ posts: mockPosts })
      )

      const expectedState = postsAdapter.setAll(mockPosts, {
        ...initialState,
        loading: false,
      })

      expect(state).toEqual(expectedState)
    })

    it('should set error on loadPostsFailure', () => {
      const state = postsReducer(
        initialState,
        PostsActions.loadPostsFailure({ error: 'Test Error' })
      )

      expect(state.loading).toEqual(false)
      expect(state.error).toEqual('Test Error')
    })
  })

  describe('createPost', () => {
    it('should add post on createPostSuccess', () => {
      const state = postsReducer(
        initialState,
        PostsActions.createPostSuccess({ post: mockPost })
      )

      const expectedState = postsAdapter.addOne(mockPost, initialState)

      expect(state.loading).toEqual(false)
      expect(state).toEqual(expectedState)
    })
  })
})
