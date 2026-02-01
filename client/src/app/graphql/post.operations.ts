import { gql } from 'apollo-angular'

export const CREATE_POST = gql`
  mutation createPost(
    $title: String
    $body: String
    $image: Upload
    $userId: String!
  ) {
    createPost(
      createPostData: {
        title: $title
        body: $body
        image: $image
        userId: $userId
      }
    ) {
      id
      title
      body
      image
    }
  }
`
