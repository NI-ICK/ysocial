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
  const tmpPost = {
    id: 'tmp-5',
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

    it('should replace optimistic post', () => {
      const state = postsReducer(
        initialState,
        PostsActions.replaceOptimisticPost({ tmpId: 'tmp-5', post: mockPost })
      )
      postsAdapter.addOne(tmpPost, state)

      const expectedState = postsAdapter.updateOne(
        { id: 'tmp-5', changes: mockPost },
        state
      )

      expect(state).toEqual(expectedState)
    })

    it('should remove optimistic post', () => {
      const state = postsReducer(
        initialState,
        PostsActions.removeOptimisticPost({ tmpId: 'tmp-5' })
      )
      postsAdapter.addOne(tmpPost, state)

      const expectedState = postsAdapter.removeOne('tmp-5', state)

      expect(state).toEqual(expectedState)
    })
  })
})
