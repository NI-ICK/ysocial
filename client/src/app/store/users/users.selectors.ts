import { createFeatureSelector, createSelector } from '@ngrx/store'
import { usersAdapter, UsersState } from './users.state'
import { User } from '../../utils/interfaces/user.interface'

export const selectUsersState = createFeatureSelector<UsersState>('users')

export const { selectEntities } = usersAdapter.getSelectors(selectUsersState)

export const selectUserProfile = createSelector(
  selectUsersState,
  selectEntities,
  (state, entities) => {
    const id = state.userProfileId
    if (!id) return null

    const user = entities[id]
    return user ?? null
  }
)

export const selectCreatedPostsLoading = createSelector(
  selectUsersState,
  (state) => state.createdPostsLoading
)

export const selectNoMoreCreatedPosts = createSelector(
  selectUsersState,
  (state) => state.noMoreCreatedPosts
)

export const selectLikedPostsLoading = createSelector(
  selectUsersState,
  (state) => state.likedPostsLoading
)

export const selectNoMoreLikedPosts = createSelector(
  selectUsersState,
  (state) => state.noMoreLikedPosts
)

export const selectFollowers = createSelector(
  selectUsersState,
  selectEntities,
  (state, entities) => {
    const ids = state.followers

    return ids.map((id) => entities[id]).filter((f): f is User => !!f)
  }
)

export const selectFollowersLoading = createSelector(
  selectUsersState,
  (state) => state.followersLoading
)

export const selectNoMoreFollowers = createSelector(
  selectUsersState,
  (state) => state.noMoreFollowers
)

export const selectFollowing = createSelector(
  selectUsersState,
  selectEntities,
  (state, entities) => {
    const ids = state.following

    return ids.map((id) => entities[id]).filter((f): f is User => !!f)
  }
)

export const selectFollowingLoading = createSelector(
  selectUsersState,
  (state) => state.followingLoading
)

export const selectNoMoreFollowing = createSelector(
  selectUsersState,
  (state) => state.noMoreFollowing
)
