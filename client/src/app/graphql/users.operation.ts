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
