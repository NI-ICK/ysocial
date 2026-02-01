import { gql } from 'apollo-angular'

export const GET_USERS = gql`
  query {
    getAllUsers {
      id
      username
      email
      provider
      providerId
    }
  }
`

export const LOGIN_USER = gql`
  mutation loginUser($email: String!, $password: String!) {
    loginUser(loginUserData: { email: $email, password: $password }) {
      access_token
    }
  }
`

export const REGISTER_USER = gql`
  mutation registerUser(
    $username: String!
    $email: String!
    $password: String!
  ) {
    registerUser(
      registerUserData: {
        username: $username
        email: $email
        password: $password
      }
    ) {
      id
      username
      email
    }
  }
`

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    getCurrentUser {
      id
      username
      email
      imagePath
    }
  }
`

export const LOGOUT_USER = gql`
  mutation logoutUser {
    logoutUser {
      success
    }
  }
`
