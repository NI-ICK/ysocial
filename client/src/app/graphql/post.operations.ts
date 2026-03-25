import { gql } from 'apollo-angular'

export const CREATE_POST = gql`
  mutation createPost($body: String, $image: Upload) {
    createPost(createPostData: { body: $body, image: $image }) {
      id
      body
      image
      createdAt
      updatedAt
      likesCount
      likedByMe
      user {
        id
        username
        imagePath
      }
    }
  }
`

export const GET_ALL_POSTS = gql`
  query {
    getAllPosts {
      id
      body
      image
      createdAt
      updatedAt
      likesCount
      likedByMe
      commentsCount
      user {
        id
        username
        imagePath
      }
    }
  }
`

export const GET_POST_BY_ID = gql`
  query getPostById($id: String!) {
    getPostById(id: $id) {
      id
      body
      image
      createdAt
      updatedAt
      likesCount
      likedByMe
      user {
        id
        username
        imagePath
      }
      comments {
        id
        body
        repliesCount
        user {
          id
          username
          imagePath
        }
      }
    }
  }
`

export const DELETE_POST = gql`
  mutation deletePost($id: String!) {
    deletePost(id: $id) {
      success
      message
    }
  }
`

export const EDIT_POST = gql`
  mutation editPost($id: String!, $body: String!) {
    editPost(editPostData: { id: $id, body: $body }) {
      id
      body
      image
      createdAt
      updatedAt
      likesCount
      likedByMe
      user {
        id
        username
        imagePath
      }
    }
  }
`

export const TOGGLE_POST_LIKE = gql`
  mutation togglePostLike($postId: String!) {
    togglePostLike(postId: $postId) {
      addLike
    }
  }
`
