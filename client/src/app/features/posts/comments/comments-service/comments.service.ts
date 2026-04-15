import { Injectable } from '@angular/core'
import { Apollo } from 'apollo-angular'
import {
  CREATE_COMMENT,
  GET_COMMENTS_BY_POST_ID,
  TOGGLE_COMMENT_LIKE,
} from '../../../../graphql/comment.operations'
import { Comment } from '../../../../utils/interfaces/comment.interface'

interface CreateCommentResponse {
  createComment: Comment
}

interface GetCommentsByPostIdResponse {
  getCommentsByPostId: Comment[]
}

interface ToggleCommentLikeResponse {
  toggleCommentLike: {
    addLike: boolean
  }
}

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  constructor(private apollo: Apollo) {}

  getCommentsByPostId(id: string) {
    return this.apollo.query<GetCommentsByPostIdResponse>({
      query: GET_COMMENTS_BY_POST_ID,
      variables: { id },
    })
  }

  createComment(body: string, postId: string, parentId: string | null) {
    return this.apollo.mutate<CreateCommentResponse>({
      mutation: CREATE_COMMENT,
      variables: { body, postId, parentId },
    })
  }

  toggleCommentLike(commentId: string) {
    return this.apollo.mutate<ToggleCommentLikeResponse>({
      mutation: TOGGLE_COMMENT_LIKE,
      variables: { commentId },
    })
  }
}
