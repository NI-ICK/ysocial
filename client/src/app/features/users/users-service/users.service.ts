import { Injectable } from '@angular/core'
import { Apollo } from 'apollo-angular'
import {
  DELETE_USER,
  GET_FOLLOWERS_OF_USER,
  GET_FOLLOWING_OF_USER,
  GET_USER_BY_USERNAME,
  IS_EMAIL_TAKEN,
  IS_USERNAME_TAKEN,
  TOGGLE_FOLLOW,
  UPDATE_USER,
  UPDATE_USER_PROFILE_IMAGE,
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

interface GetPostsCreatedByUserResponse {
  getPostsCreatedByUser: Post[]
}

interface GetPostLikedByUserResponse {
  getPostsLikedByUser: Post[]
}

interface ToggleFollowResponse {
  toggleFollow: {
    followed: boolean
  }
}

interface GetFollowersOfUserResponse {
  getFollowersOfUser: User[]
}

interface GetFollowingOfUserResponse {
  getFollowingOfUser: User[]
}

interface DeleteUserResponse {
  deleteUser: {
    success: boolean
    message: string
  }
}
interface UpdateUserResponse {
  updateUser: User
}

interface UpdateUserProfileImageResponse {
  updateUserProfileImage: User
}

type UpdateUserType = {
  newUsername?: string | null
  newBio?: string | null
  newPassword?: string | null
  newEmail?: string | null
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
    return this.apollo.query<GetPostsCreatedByUserResponse>({
      query: GET_POSTS_CREATED_BY_USER,
      variables: { userId, offset, limit: 5 },
    })
  }

  getPostsLikedByUser(userId: string, offset: number) {
    return this.apollo.query<GetPostLikedByUserResponse>({
      query: GET_POSTS_LIKED_BY_USER,
      variables: { userId, offset, limit: 5 },
    })
  }

  toggleFollow(userId: string) {
    return this.apollo.mutate<ToggleFollowResponse>({
      mutation: TOGGLE_FOLLOW,
      variables: { userId },
    })
  }

  getFollowersOfUser(username: string, offset: number) {
    return this.apollo.query<GetFollowersOfUserResponse>({
      query: GET_FOLLOWERS_OF_USER,
      variables: { username, offset, limit: 5 },
    })
  }

  getFollowingOfUser(username: string, offset: number) {
    return this.apollo.query<GetFollowingOfUserResponse>({
      query: GET_FOLLOWING_OF_USER,
      variables: { username, offset, limit: 5 },
    })
  }

  deleteUser() {
    return this.apollo.mutate<DeleteUserResponse>({
      mutation: DELETE_USER,
    })
  }

  updateUser({ newUsername, newBio, newPassword, newEmail }: UpdateUserType) {
    return this.apollo.mutate<UpdateUserResponse>({
      mutation: UPDATE_USER,
      variables: { newUsername, newBio, newPassword, newEmail },
    })
  }

  isUsernameTaken(username: string) {
    return this.apollo.query<{ isUsernameTaken: boolean }>({
      query: IS_USERNAME_TAKEN,
      variables: { username },
    })
  }

  isEmailTaken(email: string) {
    return this.apollo.query<{ isEmailTaken: boolean }>({
      query: IS_EMAIL_TAKEN,
      variables: { email },
    })
  }

  updateUserProfileImage(image: File) {
    return this.apollo.mutate<UpdateUserProfileImageResponse>({
      mutation: UPDATE_USER_PROFILE_IMAGE,
      variables: { image },
    })
  }
}
