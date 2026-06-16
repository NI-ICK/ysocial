import { gql } from 'apollo-angular'

export const GET_USER_BY_USERNAME = gql`
  query getUserByUsername($username: String!) {
    getUserByUsername(username: $username) {
      id
      username
      email
      imagePath
      bio
      followersCount
      followingCount
      followedByMe
    }
  }
`

export const TOGGLE_FOLLOW = gql`
  mutation toggleFollow($userId: String!) {
    toggleFollow(userId: $userId) {
      followed
    }
  }
`

export const GET_FOLLOWERS_OF_USER = gql`
  query getFollowersOfUser($username: String!, $limit: Int!, $offset: Int!) {
    getFollowersOfUser(username: $username, limit: $limit, offset: $offset) {
      id
      username
      email
      imagePath
      bio
      followersCount
      followingCount
      followedByMe
    }
  }
`

export const GET_FOLLOWING_OF_USER = gql`
  query getFollowingOfUser($username: String!, $limit: Int!, $offset: Int!) {
    getFollowingOfUser(username: $username, limit: $limit, offset: $offset) {
      id
      username
      email
      imagePath
      bio
      followersCount
      followingCount
      followedByMe
    }
  }
`

export const DELETE_USER = gql`
  mutation {
    deleteUser {
      success
      message
    }
  }
`

export const UPDATE_USER = gql`
  mutation updateUser(
    $newUsername: String
    $newBio: String
    $newPassword: String
    $newEmail: String
  ) {
    updateUser(
      data: {
        newUsername: $newUsername
        newBio: $newBio
        newPassword: $newPassword
        newEmail: $newEmail
      }
    ) {
      id
      username
      email
      imagePath
      bio
      followersCount
      followingCount
      followedByMe
    }
  }
`

export const IS_USERNAME_TAKEN = gql`
  query isUsernameTaken($username: String!) {
    isUsernameTaken(username: $username)
  }
`
export const IS_EMAIL_TAKEN = gql`
  query isEmailTaken($email: String!) {
    isEmailTaken(email: $email)
  }
`

export const UPDATE_USER_PROFILE_IMAGE = gql`
  mutation updateUserProfileImage($image: Upload!) {
    updateUserProfileImage(data: { image: $image }) {
      id
      username
      email
      imagePath
      bio
      followersCount
      followingCount
      followedByMe
    }
  }
`
