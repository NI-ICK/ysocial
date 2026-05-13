import { usersReducer } from '../users.reducer'
import { initialState, usersAdapter } from '../users.state'
import * as UsersActions from '../users.actions'
import { User } from '../../../utils/interfaces/user.interface'
import { Post } from '../../../utils/interfaces/post.interface'

describe('UsersReducer', () => {
  const userMock1 = {
    id: '1',
    username: 'test',
    followedByMe: false,
    followersCount: 0,
  } as User
  const userMock2 = {
    id: '2',
    username: 'test2',
  } as User
  const userMock3 = {
    id: '3',
    username: 'test3',
  } as User
  const userMock4 = {
    id: '4',
    username: 'test4',
  } as User
  const userMock5 = {
    id: '5',
    username: 'test5',
  } as User

  const postMock1 = { id: '1', body: 'test1' } as Post
  const postMock2 = { id: '2', body: 'test2' } as Post
  const postMock3 = { id: '3', body: 'test3' } as Post
  const postMock4 = { id: '4', body: 'test4' } as Post
  const postMock5 = { id: '5', body: 'test5' } as Post

  it('should return initial state', () => {
    expect(usersReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  describe('loadUserProfileSuccess', () => {
    it('should upsert users and set userProfileId', () => {
      const state = usersReducer(
        initialState,
        UsersActions.loadUserProfileSuccess({ userProfile: userMock1 })
      )

      const expectedState = usersAdapter.upsertOne(userMock1, {
        ...initialState,
        userProfileId: userMock1.id,
      })

      expect(state).toEqual(expectedState)
    })
  })

  describe('clearUserProfile', () => {
    it('should set userProfileId to null', () => {
      const init = usersAdapter.addOne(userMock1, initialState)

      const state = usersReducer(init, UsersActions.clearUserProfile())

      const expectedState = { ...init, userProfileId: null }

      expect(state).toEqual(expectedState)
    })
  })

  describe('loadCreatedPosts', () => {
    it('should set createdPostsLoading to true', () => {
      const state = usersReducer(
        initialState,
        UsersActions.loadCreatedPosts({ userId: '1', offset: 0 })
      )

      const expectedState = { ...initialState, createdPostsLoading: true }

      expect(state).toEqual(expectedState)
    })
  })

  describe('loadLikedPosts', () => {
    it('should set likedPostsLoading to true', () => {
      const state = usersReducer(
        initialState,
        UsersActions.loadLikedPosts({ userId: '1', offset: 0 })
      )

      const expectedState = { ...initialState, likedPostsLoading: true }

      expect(state).toEqual(expectedState)
    })
  })

  describe('loadCreatedPostsSuccess', () => {
    it('should set noMoreCreatedPosts to false when 5 posts are loaded', () => {
      const state = usersReducer(
        initialState,
        UsersActions.loadCreatedPostsSuccess({
          createdPosts: [postMock1, postMock2, postMock3, postMock4, postMock5],
        })
      )

      const expectedState = {
        ...initialState,
        createdPosts: ['1', '2', '3', '4', '5'],
        createdPostsLoading: false,
        noMoreCreatedPosts: false,
      }

      expect(state).toEqual(expectedState)
    })

    it('should set noMoreCreatedPosts to true when less than 5 posts are loaded', () => {
      const state = usersReducer(
        initialState,
        UsersActions.loadCreatedPostsSuccess({
          createdPosts: [postMock1, postMock2],
        })
      )

      const expectedState = {
        ...initialState,
        createdPosts: ['1', '2'],
        createdPostsLoading: false,
        noMoreCreatedPosts: true,
      }

      expect(state).toEqual(expectedState)
    })
  })

  describe('loadLikedPostsSuccess', () => {
    it('should set noMoreLikedPosts to false when 5 posts are loaded', () => {
      const state = usersReducer(
        initialState,
        UsersActions.loadLikedPostsSuccess({
          likedPosts: [postMock1, postMock2, postMock3, postMock4, postMock5],
        })
      )

      const expectedState = {
        ...initialState,
        likedPosts: ['1', '2', '3', '4', '5'],
        likedPostsLoading: false,
        noMoreLikedPosts: false,
      }

      expect(state).toEqual(expectedState)
    })

    it('should set noMoreLikedPosts to true when less than 5 posts are loaded', () => {
      const state = usersReducer(
        initialState,
        UsersActions.loadLikedPostsSuccess({
          likedPosts: [postMock1, postMock2],
        })
      )

      const expectedState = {
        ...initialState,
        likedPosts: ['1', '2'],
        likedPostsLoading: false,
        noMoreLikedPosts: true,
      }

      expect(state).toEqual(expectedState)
    })
  })

  describe('clearCreatedPosts', () => {
    it('should clear created posts data', () => {
      const init = {
        ...initialState,
        createdPosts: ['1', '2'],
        createdPostsLoading: true,
        noMoreCreatedPosts: true,
      }

      const state = usersReducer(init, UsersActions.clearCreatedPosts())

      expect(state).toEqual(initialState)
    })
  })

  describe('clearLikedPosts', () => {
    it('should clear liked posts data', () => {
      const init = {
        ...initialState,
        likedPosts: ['1', '2'],
        likedPostsLoading: true,
        noMoreLikedPosts: true,
      }

      const state = usersReducer(init, UsersActions.clearLikedPosts())

      expect(state).toEqual(initialState)
    })
  })

  describe('toggleFollow', () => {
    it('should follow user and increment followersCount', () => {
      const init = usersAdapter.addOne(userMock1, initialState)

      const state = usersReducer(
        init,
        UsersActions.toggleFollow({ userId: '1' })
      )

      const updatedUser = usersAdapter.getSelectors().selectEntities(state)['1']

      expect(updatedUser).toEqual({
        ...userMock1,
        followersCount: 1,
        followedByMe: true,
      })
    })

    it('should unfollow user and decrement followersCount', () => {
      const init = usersAdapter.addOne(
        { ...userMock1, followersCount: 1, followedByMe: true },
        initialState
      )

      const state = usersReducer(
        init,
        UsersActions.toggleFollow({ userId: '1' })
      )

      const updatedUser = usersAdapter.getSelectors().selectEntities(state)['1']

      expect(updatedUser).toEqual({
        ...userMock1,
      })
    })

    it('should return inital state if user does not exists', () => {
      const init = usersAdapter.addOne(userMock1, initialState)
      const state = usersReducer(
        init,
        UsersActions.toggleFollow({ userId: '999' })
      )

      expect(state).toEqual(init)
    })

    it('should not decrement followersCount below 0', () => {
      const init = usersAdapter.addOne(
        { ...userMock1, followedByMe: true },
        initialState
      )

      const state = usersReducer(
        init,
        UsersActions.toggleFollow({
          userId: '1',
        })
      )

      const updatedUser = usersAdapter.getSelectors().selectEntities(state)['1']

      expect(updatedUser).toEqual(userMock1)
    })
  })

  describe('toggleFollowSuccess', () => {
    it('should set followedByMe', () => {
      const init = usersAdapter.addOne(userMock1, initialState)

      const state = usersReducer(
        init,
        UsersActions.toggleFollowSuccess({ followed: true, userId: '1' })
      )
      const updatedUser = usersAdapter.getSelectors().selectEntities(state)['1']

      expect(updatedUser).toEqual({ ...userMock1, followedByMe: true })
    })

    it('should return inital state if user does not exists', () => {
      const init = usersAdapter.addOne(userMock1, initialState)
      const state = usersReducer(
        init,
        UsersActions.toggleFollowSuccess({
          followed: false,
          userId: '999',
        })
      )

      expect(state).toEqual(init)
    })
  })

  describe('loadFollowers', () => {
    it('should set followersLoading to true', () => {
      const state = usersReducer(
        initialState,
        UsersActions.loadFollowers({ username: 'test', offset: 0 })
      )

      const expectedState = { ...initialState, followersLoading: true }

      expect(state).toEqual(expectedState)
    })
  })

  describe('loadFollowersSuccess', () => {
    it('should upsert followers and set noMoreFollowers to false when 5 followers are loaded', () => {
      const state = usersReducer(
        initialState,
        UsersActions.loadFollowersSuccess({
          followers: [userMock1, userMock2, userMock3, userMock4, userMock5],
        })
      )

      const expectedState = usersAdapter.upsertMany(
        [userMock1, userMock2, userMock3, userMock4, userMock5],
        {
          ...initialState,
          noMoreFollowers: false,
          followers: ['1', '2', '3', '4', '5'],
        }
      )

      expect(state).toEqual(expectedState)
    })
  })

  describe('clearFollowers', () => {
    it('should clear followers data', () => {
      const init = {
        ...initialState,
        followers: ['1'],
        noMoreFollowers: true,
        followersLoading: true,
      }

      const state = usersReducer(init, UsersActions.clearFollowers())

      expect(state).toEqual(initialState)
    })
  })

  describe('loadFollowing', () => {
    it('should set followingLoading to true', () => {
      const state = usersReducer(
        initialState,
        UsersActions.loadFollowing({ username: 'test', offset: 0 })
      )

      const expectedState = { ...initialState, followingLoading: true }

      expect(state).toEqual(expectedState)
    })
  })

  describe('loadFollowingSuccess', () => {
    it('should upsert following and set noMoreFollowing to false when 5 following are loaded', () => {
      const state = usersReducer(
        initialState,
        UsersActions.loadFollowingSuccess({
          following: [userMock1, userMock2, userMock3, userMock4, userMock5],
        })
      )

      const expectedState = usersAdapter.upsertMany(
        [userMock1, userMock2, userMock3, userMock4, userMock5],
        {
          ...initialState,
          noMoreFollowing: false,
          following: ['1', '2', '3', '4', '5'],
        }
      )

      expect(state).toEqual(expectedState)
    })
  })

  describe('clearFollowing', () => {
    it('should clear following data', () => {
      const init = {
        ...initialState,
        following: ['1'],
        noMoreFollowing: true,
        followingLoading: true,
      }

      const state = usersReducer(init, UsersActions.clearFollowing())

      expect(state).toEqual(initialState)
    })
  })
})
