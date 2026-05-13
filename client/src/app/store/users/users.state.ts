import { createEntityAdapter, EntityState } from '@ngrx/entity'
import { User } from '../../utils/interfaces/user.interface'

export interface UsersState extends EntityState<User> {
  userProfileId: string | null

  createdPosts: string[]
  createdPostsLoading: boolean
  noMoreCreatedPosts: boolean

  likedPosts: string[]
  likedPostsLoading: boolean
  noMoreLikedPosts: boolean

  followers: string[]
  followersLoading: boolean
  noMoreFollowers: boolean

  following: string[]
  followingLoading: boolean
  noMoreFollowing: boolean
}

export const usersAdapter = createEntityAdapter<User>({})

export const initialState: UsersState = usersAdapter.getInitialState({
  userProfileId: null,

  createdPosts: [],
  createdPostsLoading: false,
  noMoreCreatedPosts: false,

  likedPosts: [],
  likedPostsLoading: false,
  noMoreLikedPosts: false,

  followers: [],
  followersLoading: false,
  noMoreFollowers: false,

  following: [],
  followingLoading: false,
  noMoreFollowing: false,
})
