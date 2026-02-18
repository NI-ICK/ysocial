import { createReducer, on } from '@ngrx/store'
import { initialState, postsAdapter } from './posts.state'
import * as PostsActions from './posts.actions'

export const postsReducer = createReducer(
  initialState,
  on(PostsActions.loadPosts, (state) => ({
    ...state,
    loading: true,
  })),
  on(PostsActions.loadPostsSuccess, (state, { posts }) =>
    postsAdapter.setAll(posts, { ...state, loading: false })
  ),
  on(PostsActions.loadPostsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(PostsActions.createPostSuccess, (state, { post }) =>
    postsAdapter.addOne(post, state)
  ),
  on(PostsActions.replaceOptimisticPost, (state, { tmpId, post }) => {
    const { image: _, ...postWithoutImage } = post
    return postsAdapter.updateOne(
      {
        id: tmpId,
        changes: {
          ...postWithoutImage,
        },
      },
      state
    )
  }),
  on(PostsActions.removeOptimisticPost, (state, { tmpId }) =>
    postsAdapter.removeOne(tmpId, state)
  )
)
