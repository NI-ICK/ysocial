import { Post } from '../../../utils/interfaces/post.interface'
import { postsReducer } from '../posts.reducer'
import { initialState, postsAdapter, PostsState } from '../posts.state'
import * as PostsActions from '../posts.actions'

describe('Posts Reducer', () => {
  const mockPosts = [
    { id: '1', body: 'test', createdAt: new Date().toISOString() } as Post,
    { id: '2', body: 'test', createdAt: new Date().toISOString() } as Post,
  ]
  const mockPost = {
    id: '3',
    body: 'test',
    image: null,
    likedByMe: false,
    likesCount: 0,
    commentsCount: 0,
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

      expect(state.postsLoading).toEqual(true)
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

      expect(state.postsLoading).toEqual(false)
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

      expect(state.postsLoading).toEqual(false)
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

  describe('loadCurrentPost', () => {
    it('should set current post on loadCurrentPostSuccess', () => {
      const state = postsReducer(
        initialState,
        PostsActions.loadCurrentPostSuccess({ post: mockPost })
      )

      expect(state.currentPostId).toEqual(mockPost.id)
    })

    it('should set current post to null on clearCurrentPost', () => {
      const state = postsReducer(initialState, PostsActions.clearCurrentPost())

      expect(state.currentPostId).toEqual(null)
    })
  })

  describe('deletePost', () => {
    it('should delete post on deletePost', () => {
      const stateWithPost: PostsState = postsAdapter.setAll([mockPost], {
        ...initialState,
        currentPost: mockPost,
      })

      const state = postsReducer(
        stateWithPost,
        PostsActions.deletePost({ post: mockPost })
      )

      expect(state.entities[mockPost.id]).toBeUndefined()
      expect(postsAdapter.getSelectors().selectIds(state)).not.toContain(
        mockPost.id
      )
      expect(state.currentPostId).toEqual(null)
    })

    it('should add post back on deletePostFailure', () => {
      const state = postsReducer(
        initialState,
        PostsActions.deletePostFailure({ error: 'test error', post: mockPost })
      )

      const expectedState = postsAdapter.addOne(mockPost, initialState)

      expect(state).toEqual(expectedState)
    })
  })

  describe('editPost', () => {
    it('should update post on editPost', () => {
      const stateWithPost = postsAdapter.addOne(mockPost, initialState)
      const state = postsReducer(
        stateWithPost,
        PostsActions.editPost({ id: '1', body: 'test2', prevBody: 'test' })
      )

      const expectedState = postsAdapter.updateOne(
        { id: '1', changes: { body: 'test2' } },
        stateWithPost
      )

      expect(state).toEqual(expectedState)
    })

    it('should update post on editPostSuccess', () => {
      const stateWithPost = postsAdapter.addOne(mockPost, initialState)

      const updatedPost = { ...mockPost, body: 'test3' }

      const state = postsReducer(
        stateWithPost,
        PostsActions.editPostSuccess({ post: updatedPost })
      )

      const expectedState = postsAdapter.updateOne(
        { id: updatedPost.id, changes: updatedPost },
        stateWithPost
      )

      expect(state).toEqual(expectedState)
    })

    it('should rollback post body on editPostFailure', () => {
      const updatedPost = { ...mockPost, body: 'test3' }
      const stateWithPost = postsAdapter.addOne(updatedPost, initialState)

      const state = postsReducer(
        stateWithPost,
        PostsActions.editPostFailure({
          error: 'test error',
          id: '3',
          prevBody: 'test',
        })
      )

      const expectedState = postsAdapter.updateOne(
        { id: updatedPost.id, changes: mockPost },
        stateWithPost
      )

      expect(state).toEqual(expectedState)
    })
  })

  describe('togglePostLike', () => {
    it('should update likedByMe and likesCount fields and likingPost on togglePostLike', () => {
      const stateWithPost = postsAdapter.addOne(mockPost, initialState)

      const state = postsReducer(
        stateWithPost,
        PostsActions.togglePostLike({ postId: '3' })
      )

      const expectedState = postsAdapter.updateOne(
        { id: '3', changes: { likedByMe: true, likesCount: 1 } },
        stateWithPost
      )

      expect(state).toEqual({ ...expectedState, likingPost: { '3': true } })
    })

    it('should remove likingPost on togglePostLikeSuccess', () => {
      const initial = { ...initialState, likingPost: { '1': true, '2': true } }

      const state = postsReducer(
        initial,
        PostsActions.togglePostLikeSuccess({ postId: '1' })
      )

      expect(state.likingPost).toEqual({ '2': true })
    })
  })

  describe('incrementCommentsCount', () => {
    const state = postsAdapter.addOne(mockPost, initialState)
    const action = PostsActions.incrementCommentsCount({ postId: '3' })
    const updatedState = postsReducer(state, action)

    const expectedState = postsAdapter.addOne(
      { ...mockPost, commentsCount: 1 },
      initialState
    )

    expect(updatedState).toEqual(expectedState)
  })
})
