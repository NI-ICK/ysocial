import { createAction, props } from '@ngrx/store'
import { User } from '../../utils/interfaces/user.interface'
import { Post } from '../../utils/interfaces/post.interface'

// ----- Load User Profile -----
export const loadUserProfile = createAction(
  '[Users] Load User Profile',
  props<{ username: string }>()
)
export const loadUserProfileSuccess = createAction(
  '[Users] Load User Profile Success',
  props<{ userProfile: User }>()
)
export const loadUserProfileFailure = createAction(
  '[Users] Load User Profile Failure',
  props<{ error: string }>()
)
export const clearUserProfile = createAction('[Users] Clear User Profile')

// ----- Load Created Posts -----
export const loadCreatedPosts = createAction(
  '[Users] Load Created Posts',
  props<{ userId: string; offset: number }>()
)
export const loadCreatedPostsSuccess = createAction(
  '[Users] Load Created Posts Success',
  props<{ createdPosts: Post[] }>()
)
export const loadCreatedPostsFailure = createAction(
  '[Users] Load Created Posts Failure',
  props<{ error: string }>()
)
export const clearCreatedPosts = createAction('[Users] Clear Created Posts')

// ----- Load Liked Posts -----
export const loadLikedPosts = createAction(
  '[Users] Load Liked Posts',
  props<{ userId: string; offset: number }>()
)
export const loadLikedPostsSuccess = createAction(
  '[Users] Load Liked Posts Success',
  props<{ likedPosts: Post[] }>()
)
export const loadLikedPostsFailure = createAction(
  '[Users] Load Liked Posts Failure',
  props<{ error: string }>()
)
export const clearLikedPosts = createAction('[Users] Clear Liked Posts')

// ----- Toggle Follow -----
export const toggleFollow = createAction(
  '[Users] Toggle Follow',
  props<{ userId: string }>()
)
export const toggleFollowSuccess = createAction(
  '[Users] Toggle Follow Success',
  props<{ followed: boolean; userId: string }>()
)
export const toggleFollowFailure = createAction(
  '[Users] Toggle Follow Failure',
  props<{ error: string }>()
)

// ----- Load Followers -----
export const loadFollowers = createAction(
  '[Users] Load Followers',
  props<{ username: string; offset: number }>()
)
export const loadFollowersSuccess = createAction(
  '[Users] Load Followers Success',
  props<{ followers: User[] }>()
)
export const loadFollowersFailure = createAction(
  '[Users] Load Followers Failure',
  props<{ error: string }>()
)
export const clearFollowers = createAction('[Users] Clear Followers')

// ----- Load Following -----
export const loadFollowing = createAction(
  '[Users] Load Following',
  props<{ username: string; offset: number }>()
)
export const loadFollowingSuccess = createAction(
  '[Users] Load Following Success',
  props<{ following: User[] }>()
)
export const loadFollowingFailure = createAction(
  '[Users] Load Following Failure',
  props<{ error: string }>()
)
export const clearFollowing = createAction('[Users] Clear Following')
