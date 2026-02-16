import { Post } from '../../utils/post.interface'
import { EntityState, createEntityAdapter } from '@ngrx/entity'

export interface PostsState extends EntityState<Post> {
  loading: boolean
  error: string | null
}

export const postsAdapter = createEntityAdapter<Post>({
  sortComparer: (a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
})

export const initialState: PostsState = postsAdapter.getInitialState({
  loading: false,
  error: null,
})
