import { gql } from 'apollo-angular'

export const GET_COMMENTS_BY_POST_ID = gql`
  query getCommentsByPostId($id: String!) {
    getCommentsByPostId(id: $id) {
      id
      body
      repliesCount
      likesCount
      likedByMe
      createdAt
      user {
        id
        username
        imagePath
      }
      parent {
        id
      }
    }
  }
`

export const GET_REPLIES_BY_PARENT_ID = gql`
  query getRepliesByParentId($id: String!) {
    getRepliesByParentId(id: $id) {
      id
      body
      repliesCount
      likesCount
      likedByMe
      createdAt
      user {
        id
        username
        imagePath
      }
      parent {
        id
      }
    }
  }
`

export const CREATE_COMMENT = gql`
  mutation createComment($body: String!, $postId: String!, $parentId: String) {
    createComment(
      createCommentData: { body: $body, postId: $postId, parentId: $parentId }
    ) {
      id
      body
      repliesCount
      likesCount
      likedByMe
      createdAt
      user {
        id
        username
        imagePath
      }
      parent {
        id
      }
    }
  }
`

export const TOGGLE_COMMENT_LIKE = gql`
  mutation toggleCommentLike($commentId: String!) {
    toggleCommentLike(commentId: $commentId) {
      addLike
    }
  }
`
