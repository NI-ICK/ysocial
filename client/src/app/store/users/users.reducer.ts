import { createReducer, on } from '@ngrx/store'
import { initialState, usersAdapter } from './users.state'
import * as UsersActions from './users.actions'

export const usersReducer = createReducer(
  initialState,
  on(UsersActions.loadUserProfileSuccess, (state, { userProfile }) => {
    const updatedState = usersAdapter.upsertOne(userProfile, state)

    return { ...updatedState, userProfileId: userProfile.id }
  }),
  on(UsersActions.clearUserProfile, (state) => {
    return { ...state, userProfileId: null }
  }),
  on(UsersActions.loadCreatedPosts, (state) => ({
    ...state,
    createdPostsLoading: true,
  })),
  on(UsersActions.loadLikedPosts, (state) => ({
    ...state,
    likedPostsLoading: true,
  })),
  on(UsersActions.loadCreatedPostsSuccess, (state, { createdPosts }) => ({
    ...state,
    createdPosts: [...state.createdPosts, ...createdPosts.map((p) => p.id)],
    createdPostsLoading: false,
    noMoreCreatedPosts: createdPosts.length < 5,
  })),
  on(UsersActions.loadLikedPostsSuccess, (state, { likedPosts }) => ({
    ...state,
    likedPosts: [...state.likedPosts, ...likedPosts.map((p) => p.id)],
    likedPostsLoading: false,
    noMoreLikedPosts: likedPosts.length < 5,
  })),
  on(UsersActions.clearCreatedPosts, (state) => ({
    ...state,
    createdPosts: [],
    createdPostsLoading: false,
    noMoreCreatedPosts: false,
  })),
  on(UsersActions.clearLikedPosts, (state) => ({
    ...state,
    likedPosts: [],
    likedPostsLoading: false,
    noMoreLikedPosts: false,
  })),
  on(UsersActions.toggleFollow, (state, { userId }) => {
    const user = usersAdapter.getSelectors().selectEntities(state)[userId]
    if (!user) return state

    const followedByMe = !user.followedByMe

    return usersAdapter.updateOne(
      {
        id: userId,
        changes: {
          followersCount: followedByMe
            ? user.followersCount + 1
            : Math.max(0, user.followersCount - 1),
          followedByMe: followedByMe,
        },
      },
      state
    )
  }),
  on(UsersActions.toggleFollowSuccess, (state, { followed, userId }) => {
    const user = usersAdapter.getSelectors().selectEntities(state)[userId]
    if (!user) return state

    return usersAdapter.updateOne(
      {
        id: userId,
        changes: {
          followedByMe: followed,
        },
      },
      state
    )
  }),
  on(UsersActions.loadFollowers, (state) => ({
    ...state,
    followersLoading: true,
  })),
  on(UsersActions.loadFollowersSuccess, (state, { followers }) => {
    if (!followers.length) {
      return { ...state, followersLoading: false, noMoreFollowers: true }
    }

    const updatedState = usersAdapter.upsertMany(followers, state)

    return {
      ...updatedState,
      followers: [...updatedState.followers, ...followers.map((f) => f.id)],
      followersLoading: false,
      noMoreFollowers: followers.length < 5,
    }
  }),
  on(UsersActions.clearFollowers, (state) => ({
    ...state,
    followers: [],
    noMoreFollowers: false,
    followersLoading: false,
  })),
  on(UsersActions.loadFollowing, (state) => ({
    ...state,
    followingLoading: true,
  })),
  on(UsersActions.loadFollowingSuccess, (state, { following }) => {
    if (!following.length) {
      return { ...state, followingLoading: false, noMoreFollowing: true }
    }

    const updatedState = usersAdapter.upsertMany(following, state)

    return {
      ...updatedState,
      following: [...updatedState.following, ...following.map((f) => f.id)],
      followingLoading: false,
      noMoreFollowing: following.length < 5,
    }
  }),
  on(UsersActions.clearFollowing, (state) => ({
    ...state,
    following: [],
    noMoreFollowing: false,
    followingLoading: false,
  }))
)
