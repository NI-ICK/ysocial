import { Injectable } from '@angular/core'
import { CREATE_POST, GET_ALL_POSTS } from '../../../graphql/post.operations'
import { Post } from '../../../utils/post.interface'
import { Apollo } from 'apollo-angular'

interface GetAllPostsResponse {
  getAllPosts: Post[]
}

interface CreatePostResponse {
  createPost: Post
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

  createPost(userId: string, body: string | null, file: File | null) {
    return this.apollo.mutate<CreatePostResponse>({
      mutation: CREATE_POST,
      variables: { userId, body, image: file },
    })
  }
}
