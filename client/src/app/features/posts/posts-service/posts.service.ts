import { Injectable } from '@angular/core'
import {
  CREATE_POST,
  DELETE_POST,
  EDIT_POST,
  GET_ALL_POSTS,
  GET_POST_BY_ID,
  TOGGLE_POST_LIKE,
} from '../../../graphql/post.operations'
import { Post } from '../../../utils/interfaces/post.interface'
import { Apollo } from 'apollo-angular'

interface GetAllPostsResponse {
  getAllPosts: Post[]
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

  getAllPosts() {
    return this.apollo.query<GetAllPostsResponse>({
      query: GET_ALL_POSTS,
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
