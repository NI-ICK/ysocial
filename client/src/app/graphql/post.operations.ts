import { gql } from 'apollo-angular'

export const CREATE_POST = gql`
  mutation createPost($body: String, $image: Upload, $userId: String!) {
    createPost(
      createPostData: { body: $body, image: $image, userId: $userId }
    ) {
      id
      body
      image
      createdAt
      updatedAt
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
      user {
        id
        username
        imagePath
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
      user {
        id
        username
        imagePath
      }
    }
  }
`
