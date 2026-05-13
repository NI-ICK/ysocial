import { Injectable } from '@angular/core'
import { Apollo } from 'apollo-angular'
import {
  GET_FOLLOWERS_OF_USER,
  GET_FOLLOWING_OF_USER,
  GET_USER_BY_USERNAME,
  TOGGLE_FOLLOW,
} from '../../../graphql/users.operation'
import { User } from '../../../utils/interfaces/user.interface'
import {
  GET_POSTS_CREATED_BY_USER,
  GET_POSTS_LIKED_BY_USER,
} from '../../../graphql/post.operations'
import { Post } from '../../../utils/interfaces/post.interface'

interface GetUserByUsernameResponse {
  getUserByUsername: User
}

interface GetPostsCreatedByUser {
  getPostsCreatedByUser: Post[]
}

interface GetPostLikedByUser {
  getPostsLikedByUser: Post[]
}

interface ToggleFollow {
  toggleFollow: {
    followed: boolean
  }
}

interface GetFollowersOfUser {
  getFollowersOfUser: User[]
}

interface GetFollowingOfUser {
  getFollowingOfUser: User[]
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private apollo: Apollo) {}

  getUserByUsername(username: string) {
    return this.apollo.query<GetUserByUsernameResponse>({
      query: GET_USER_BY_USERNAME,
      variables: { username },
    })
  }

  getPostsCreatedByUser(userId: string, offset: number) {
    return this.apollo.query<GetPostsCreatedByUser>({
      query: GET_POSTS_CREATED_BY_USER,
      variables: { userId, offset, limit: 5 },
    })
  }

  getPostsLikedByUser(userId: string, offset: number) {
    return this.apollo.query<GetPostLikedByUser>({
      query: GET_POSTS_LIKED_BY_USER,
      variables: { userId, offset, limit: 5 },
    })
  }

  toggleFollow(userId: string) {
    return this.apollo.mutate<ToggleFollow>({
      mutation: TOGGLE_FOLLOW,
      variables: { userId },
    })
  }

  getFollowersOfUser(username: string, offset: number) {
    return this.apollo.query<GetFollowersOfUser>({
      query: GET_FOLLOWERS_OF_USER,
      variables: { username, offset, limit: 5 },
    })
  }

  getFollowingOfUser(username: string, offset: number) {
    return this.apollo.query<GetFollowingOfUser>({
      query: GET_FOLLOWING_OF_USER,
      variables: { username, offset, limit: 5 },
    })
  }
}
