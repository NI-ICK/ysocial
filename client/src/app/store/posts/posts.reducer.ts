import { createReducer, on } from '@ngrx/store'
import { initialState, postsAdapter, PostsState } from './posts.state'
import * as PostsActions from './posts.actions'
import { Post } from '../../utils/post.interface'

const updatePost = (id: string, changes: Partial<Post>, state: PostsState) => {
  return postsAdapter.updateOne({ id, changes }, state)
}

export const postsReducer = createReducer(
  initialState,
  on(PostsActions.loadPosts, (state) => ({
    ...state,
    postsLoading: true,
  })),
  on(PostsActions.loadPostsSuccess, (state, { posts }) =>
    postsAdapter.setAll(posts, { ...state, loading: false })
  ),
  on(PostsActions.loadPostsFailure, (state, { error }) => ({
    ...state,
    postsLoading: false,
    error,
  })),
  on(PostsActions.createPostSuccess, (state, { post }) =>
    postsAdapter.addOne(post, state)
  ),
  on(PostsActions.replaceOptimisticPost, (state, { tmpId, post }) => {
    const { image: _, ...postWithoutImage } = post
    return updatePost(tmpId, { ...postWithoutImage }, state)
  }),
  on(PostsActions.removeOptimisticPost, (state, { tmpId }) =>
    postsAdapter.removeOne(tmpId, state)
  ),
  on(PostsActions.loadCurrentPostSuccess, (state, { post }) =>
    postsAdapter.upsertOne(post, {
      ...state,
      currentPostId: post.id,
    })
  ),
  on(PostsActions.clearCurrentPost, (state) => ({
    ...state,
    currentPostId: null,
  })),
  on(PostsActions.deletePost, (state, { post }) => {
    const newState = postsAdapter.removeOne(post.id, state)

    return {
      ...newState,
      currentPostId:
        state.currentPostId === post.id ? null : state.currentPostId,
    }
  }),
  on(PostsActions.deletePostFailure, (state, { post }) => {
    if (!post) return state

    return postsAdapter.addOne(post, state)
  }),
  on(PostsActions.editPost, (state, { id, body }) =>
    updatePost(id, { body }, state)
  ),
  on(PostsActions.editPostSuccess, (state, { post }) =>
    updatePost(post.id, post, state)
  ),
  on(PostsActions.editPostFailure, (state, { id, prevBody }) =>
    updatePost(id, { body: prevBody }, state)
  ),
  on(PostsActions.togglePostLike, (state, { postId }) => {
    const post = state.entities[postId]

    if (!post) return state

    const likedByMe = !post.likedByMe

    const updatedState = postsAdapter.updateOne(
      {
        id: postId,
        changes: {
          likedByMe,
          likesCount: likedByMe
            ? post.likesCount + 1
            : Math.max(0, post.likesCount - 1),
        },
      },
      state
    )

    return {
      ...updatedState,
      likingPost: { ...updatedState.likingPost, [postId]: true },
    }
  }),
  on(PostsActions.togglePostLikeSuccess, (state, { postId }) => {
    const { [postId]: _, ...rest } = state.likingPost

    return { ...state, likingPost: rest }
  })
)
