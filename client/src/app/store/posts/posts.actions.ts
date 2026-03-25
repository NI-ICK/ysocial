import { createAction, props } from '@ngrx/store'
import { Post } from '../../utils/post.interface'

// ----- Load Posts -----
export const loadPosts = createAction('[Posts] Load Posts')
export const loadPostsSuccess = createAction(
  '[Posts] Load Posts Success',
  props<{ posts: Post[] }>()
)
export const loadPostsFailure = createAction(
  '[Posts] Load Posts Failure',
  props<{ error: string }>()
)

// ----- Create Post -----
export const createPost = createAction(
  '[Posts] Create Post',
  props<{ body: string | null; file: File | null }>()
)
export const createPostSuccess = createAction(
  '[Posts] Create Post Success',
  props<{ post: Post }>()
)
export const createPostFailure = createAction(
  '[Posts] Create Post Failure',
  props<{ error: string }>()
)
export const replaceOptimisticPost = createAction(
  '[Posts] Replace Optimistic Post',
  props<{ tmpId: string; post: Post }>()
)
export const removeOptimisticPost = createAction(
  '[Posts] Remove Optimistic Post',
  props<{ tmpId: string }>()
)

// ----- Load Current Post -----
export const loadCurrentPost = createAction(
  '[Posts] Load Current Post',
  props<{ id: string }>()
)
export const loadCurrentPostSuccess = createAction(
  '[Posts] Load Current Post Success',
  props<{ post: Post }>()
)
export const loadCurrentPostFailure = createAction(
  '[Posts] Load Current Post Failure',
  props<{ error: string }>()
)
export const clearCurrentPost = createAction('[Posts] Clear Current Post')

// ----- Delete Post -----
export const deletePost = createAction(
  '[Posts] Delete Post',
  props<{ post: Post }>()
)
export const deletePostSuccess = createAction('[Posts] Delete Post Success')
export const deletePostFailure = createAction(
  '[Posts] Delete Post Failure',
  props<{ error: string; post: Post | null }>()
)

// ----- Edit Post -----
export const editPost = createAction(
  '[Posts] Edit Post',
  props<{ id: string; body: string; prevBody: string | null }>()
)
export const editPostSuccess = createAction(
  '[Posts] Edit Post Success',
  props<{ post: Post }>()
)
export const editPostFailure = createAction(
  '[Posts] Edit Post Failure',
  props<{ error: string; prevBody: string | null; id: string }>()
)

// ----- Toggle Post Like -----
export const togglePostLike = createAction(
  '[Posts] Toggle Post Like',
  props<{ postId: string }>()
)
export const togglePostLikeSuccess = createAction(
  '[Posts] Toggle Post Like Success',
  props<{ postId: string }>()
)
export const togglePostLikeFailure = createAction(
  '[Posts] Toggle Post Like Failure',
  props<{ error: string }>()
)
