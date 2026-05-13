import { Post } from '../../utils/interfaces/post.interface'
import { EntityState, createEntityAdapter } from '@ngrx/entity'

export interface PostsState extends EntityState<Post> {
  currentPostId: string | null
  postsLoading: boolean
  error: string | null
  likingPost: Record<string, boolean>
  noMorePosts: boolean
}

export const postsAdapter = createEntityAdapter<Post>({
  sortComparer: (a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
})

export const initialState: PostsState = postsAdapter.getInitialState({
  currentPostId: null,
  postsLoading: false,
  error: null,
  likingPost: {},
  noMorePosts: false,
})
