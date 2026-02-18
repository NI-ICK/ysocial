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
