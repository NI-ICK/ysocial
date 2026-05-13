import { Post } from '../../../utils/interfaces/post.interface'
import { User } from '../../../utils/interfaces/user.interface'
import { initialState, usersAdapter, UsersState } from '../users.state'
import * as UsersSelectors from '../users.selectors'

describe('UsersSelectors', () => {
  const postMock1 = { id: '1', body: 'test1' } as Post
  const postMock2 = { id: '2', body: 'test2' } as Post
  const postMock3 = { id: '3', body: 'test3' } as Post

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

  const mockState: UsersState = {
    ...usersAdapter.setAll([userMock1, userMock2, userMock3], initialState),
    userProfileId: '3',

    createdPosts: ['1', '2', '3'],
    createdPostsLoading: false,
    noMoreCreatedPosts: true,

    likedPosts: ['1', '2', '3'],
    likedPostsLoading: false,
    noMoreLikedPosts: true,

    followers: ['1', '2', '3'],
    followersLoading: false,
    noMoreFollowers: true,

    following: ['1', '2', '3'],
    followingLoading: false,
    noMoreFollowing: true,
  }

  const appState = { users: mockState }

  it('should select users feature state', () => {
    const result = UsersSelectors.selectUsersState(appState)

    expect(result).toEqual(mockState)
  })

  it('should select userProfile', () => {
    const result = UsersSelectors.selectUserProfile(appState)

    expect(result).toEqual(userMock3)
  })

  it('should select createdPostsLoading', () => {
    const result = UsersSelectors.selectCreatedPostsLoading(appState)

    expect(result).toEqual(false)
  })

  it('should select noMoreCreatedPosts', () => {
    const result = UsersSelectors.selectNoMoreCreatedPosts(appState)

    expect(result).toEqual(true)
  })

  it('should select likedPostsLoading', () => {
    const result = UsersSelectors.selectLikedPostsLoading(appState)

    expect(result).toEqual(false)
  })

  it('should select noMoreLikedPosts', () => {
    const result = UsersSelectors.selectNoMoreLikedPosts(appState)

    expect(result).toEqual(true)
  })

  it('should select followers', () => {
    const result = UsersSelectors.selectFollowers(appState)

    expect(result).toEqual([userMock1, userMock2, userMock3])
  })

  it('should select followersLoading', () => {
    const result = UsersSelectors.selectFollowersLoading(appState)

    expect(result).toEqual(false)
  })

  it('should select noMoreFollowers', () => {
    const result = UsersSelectors.selectNoMoreFollowers(appState)

    expect(result).toEqual(true)
  })

  it('should select following', () => {
    const result = UsersSelectors.selectFollowing(appState)

    expect(result).toEqual([userMock1, userMock2, userMock3])
  })

  it('should select followingLoading', () => {
    const result = UsersSelectors.selectFollowingLoading(appState)

    expect(result).toEqual(false)
  })

  it('should select noMoreFollowing', () => {
    const result = UsersSelectors.selectNoMoreFollowing(appState)

    expect(result).toEqual(true)
  })
})
