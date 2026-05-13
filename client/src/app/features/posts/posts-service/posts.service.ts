import { Injectable } from '@angular/core'
import {
  CREATE_POST,
  DELETE_POST,
  EDIT_POST,
  GET_POSTS,
  GET_POST_BY_ID,
  TOGGLE_POST_LIKE,
} from '../../../graphql/post.operations'
import { Post } from '../../../utils/interfaces/post.interface'
import { Apollo } from 'apollo-angular'

interface GetPostsResponse {
  getPosts: Post[]
}

interface CreatePostResponse {
  createPost: Post
}

interface GetPostByIdResponse {
  getPostById: Post
}

interface DeletePostResponse {
  deletePost: {
    success: boolean
    message: string
  }
}

interface EditPostResponse {
  editPost: Post
}

interface TogglePostLikeResponse {
  togglePostLike: {
    addLike: boolean
  }
}

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  constructor(private apollo: Apollo) {}

  getPosts(offset: number) {
    return this.apollo.query<GetPostsResponse>({
      query: GET_POSTS,
      variables: { limit: 5, offset },
      fetchPolicy: 'network-only',
    })
  }

  getPostById(id: string) {
    return this.apollo.query<GetPostByIdResponse>({
      query: GET_POST_BY_ID,
      variables: { id },
    })
  }

  createPost(body: string | null, file: File | null) {
    return this.apollo.mutate<CreatePostResponse>({
      mutation: CREATE_POST,
      variables: { body, image: file },
    })
  }

  deletePost(id: string) {
    return this.apollo.mutate<DeletePostResponse>({
      mutation: DELETE_POST,
      variables: { id },
    })
  }

  editPost(id: string, body: string) {
    return this.apollo.mutate<EditPostResponse>({
      mutation: EDIT_POST,
      variables: { id, body },
    })
  }

  togglePostLike(postId: string) {
    return this.apollo.mutate<TogglePostLikeResponse>({
      mutation: TOGGLE_POST_LIKE,
      variables: { postId },
    })
  }
}
