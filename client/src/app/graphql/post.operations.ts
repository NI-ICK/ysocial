import { gql } from 'apollo-angular'

export const CREATE_POST = gql`
  mutation createPost($body: String, $image: Upload, $userId: String!) {
    createPost(
      createPostData: { body: $body, image: $image, userId: $userId }
    ) {
      id
      body
      image
    }
  }
`
