import { TestBed } from '@angular/core/testing'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { UsersEffects } from '../users.effects'
import { UsersService } from '../../../features/users/users-service/users.service'
import { provideMockActions } from '@ngrx/effects/testing'
import { Actions } from '@ngrx/effects'
import * as UsersActions from '../users.actions'
import { of, take, throwError, toArray } from 'rxjs'
import { User } from '../../../utils/interfaces/user.interface'
import { Post } from '../../../utils/interfaces/post.interface'

describe('UsersEffects', () => {
  let effects: UsersEffects
  let usersService: Partial<UsersService>
  let mockStore: MockStore
  let actions$: Actions

  const userMock = { id: '1', username: 'test' } as User
  const postMock = { id: '2', body: 'test' } as Post

  beforeEach(() => {
    usersService = {
      getUserByUsername: jest.fn(),
      getPostsCreatedByUser: jest.fn(),
      getPostsLikedByUser: jest.fn(),
      toggleFollow: jest.fn(),
      getFollowersOfUser: jest.fn(),
      getFollowingOfUser: jest.fn(),
    }

    TestBed.configureTestingModule({
      providers: [
        UsersEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: UsersService, useValue: usersService },
      ],
    })
    effects = TestBed.inject(UsersEffects)
    mockStore = TestBed.inject(MockStore)
  })

  describe('loadUserProfile', () => {
    it('should dispatch loadUserProfileSuccess when usersService.getUserByUsername succeeds', (done) => {
      ;(usersService.getUserByUsername as jest.Mock).mockReturnValue(
        of({ data: { getUserByUsername: userMock } })
      )

      actions$ = of(UsersActions.loadUserProfile({ username: 'test' }))

      effects.loadUserProfile$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.loadUserProfileSuccess({ userProfile: userMock })
        )
        done()
      })
    })

    it('should dispatch loadUserProfileFailure when usersService.getUserByUsername fails', (done) => {
      ;(usersService.getUserByUsername as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(UsersActions.loadUserProfile({ username: 'test' }))

      effects.loadUserProfile$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.loadUserProfileFailure({ error: 'test error' })
        )
        done()
      })
    })

    it('should dispatch loadUserProfileFailure when usersService.getUserByUsername returns null', (done) => {
      ;(usersService.getUserByUsername as jest.Mock).mockReturnValue(
        of({ data: { getUserByUsername: null } })
      )

      actions$ = of(UsersActions.loadUserProfile({ username: 'test' }))

      effects.loadUserProfile$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.loadUserProfileFailure({
            error: 'Failed to load user profile',
          })
        )
        done()
      })
    })

    describe('loadUserProfileSuccess', () => {
      it('should dispatch four actions', (done) => {
        actions$ = of(
          UsersActions.loadUserProfileSuccess({ userProfile: userMock })
        )

        effects.loadUserProfileSuccess$.pipe(toArray()).subscribe((actions) => {
          expect(actions[0]).toEqual(UsersActions.clearCreatedPosts())
          expect(actions[1]).toEqual(UsersActions.clearLikedPosts())
          expect(actions[2]).toEqual(
            UsersActions.loadCreatedPosts({ userId: '1', offset: 0 })
          ),
            expect(actions[3]).toEqual(
              UsersActions.loadLikedPosts({ userId: '1', offset: 0 })
            ),
            done()
        })
      })
    })
  })

  describe('loadCreatedPosts', () => {
    it('should dispatch loadCreatedPostsSuccess when usersService.getPostsCreatedByUser succeeds', (done) => {
      ;(usersService.getPostsCreatedByUser as jest.Mock).mockReturnValue(
        of({ data: { getPostsCreatedByUser: [postMock] } })
      )

      actions$ = of(UsersActions.loadCreatedPosts({ userId: '1', offset: 0 }))

      effects.loadCreatedPosts$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.loadCreatedPostsSuccess({ createdPosts: [postMock] })
        )
        done()
      })
    })

    it('should dispatch loadCreatedPostsSuccess when usersService.getPostsCreatedByUser fails', (done) => {
      ;(usersService.getPostsCreatedByUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(UsersActions.loadCreatedPosts({ userId: '1', offset: 0 }))

      effects.loadCreatedPosts$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.loadCreatedPostsFailure({ error: 'test error' })
        )
        done()
      })
    })
  })

  describe('loadLikedPosts', () => {
    it('should dispatch loadLikedPostsSuccess when usersService.getPostsLikedByUser succeeds', (done) => {
      ;(usersService.getPostsLikedByUser as jest.Mock).mockReturnValue(
        of({ data: { getPostsLikedByUser: [postMock] } })
      )

      actions$ = of(UsersActions.loadLikedPosts({ userId: '1', offset: 0 }))

      effects.loadLikedPosts$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.loadLikedPostsSuccess({ likedPosts: [postMock] })
        )
        done()
      })
    })

    it('should dispatch loadLikedPostsSuccess when usersService.getPostsLikedByUser fails', (done) => {
      ;(usersService.getPostsLikedByUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(UsersActions.loadLikedPosts({ userId: '1', offset: 0 }))

      effects.loadLikedPosts$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.loadLikedPostsFailure({ error: 'test error' })
        )
        done()
      })
    })
  })

  describe('toggleFollow', () => {
    it('should dispatch toggleFollowSuccess when usersService.toggleFollow succeeds', (done) => {
      ;(usersService.toggleFollow as jest.Mock).mockReturnValue(
        of({ data: { toggleFollow: { followed: true } } })
      )

      actions$ = of(UsersActions.toggleFollow({ userId: '2' }))

      effects.toggleFollow$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.toggleFollowSuccess({ userId: '2', followed: true })
        )
        done()
      })
    })

    it('should dispatch toggleFollowFailure when usersService.toggleFollow fails', (done) => {
      ;(usersService.toggleFollow as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(UsersActions.toggleFollow({ userId: '2' }))

      effects.toggleFollow$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.toggleFollowFailure({ error: 'test error' })
        )
        done()
      })
    })

    it('should dispatch toggleFollowSuccess when usersService.toggleFollow returns null', (done) => {
      ;(usersService.toggleFollow as jest.Mock).mockReturnValue(
        of({ data: { toggleFollow: null } })
      )

      actions$ = of(UsersActions.toggleFollow({ userId: '2' }))

      effects.toggleFollow$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.toggleFollowFailure({ error: 'Empty response' })
        )
        done()
      })
    })

    it('should dispatch toggleFollowSuccess when usersService.toggleFollow returns undefined', (done) => {
      ;(usersService.toggleFollow as jest.Mock).mockReturnValue(
        of({ data: { toggleFollow: {} } })
      )

      actions$ = of(UsersActions.toggleFollow({ userId: '2' }))

      effects.toggleFollow$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.toggleFollowFailure({ error: 'Empty response' })
        )
        done()
      })
    })
  })

  describe('loadFollowers', () => {
    it('should dispatch loadFollowersSuccess when usersService.getFollowersOfUser succeeds', (done) => {
      ;(usersService.getFollowersOfUser as jest.Mock).mockReturnValue(
        of({ data: { getFollowersOfUser: [userMock] } })
      )

      actions$ = of(UsersActions.loadFollowers({ username: 'test', offset: 0 }))

      effects.loadFollowers$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.loadFollowersSuccess({ followers: [userMock] })
        )
        done()
      })
    })

    it('should dispatch loadFollowersSuccess when usersService.getFollowersOfUser fails', (done) => {
      ;(usersService.getFollowersOfUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(UsersActions.loadFollowers({ username: 'test', offset: 0 }))

      effects.loadFollowers$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.loadFollowersFailure({ error: 'test error' })
        )
        done()
      })
    })
  })

  describe('loadFollowing', () => {
    it('should dispatch loadFollowersSuccess when usersService.getFollowingOfUser succeeds', (done) => {
      ;(usersService.getFollowingOfUser as jest.Mock).mockReturnValue(
        of({ data: { getFollowingOfUser: [userMock] } })
      )

      actions$ = of(UsersActions.loadFollowing({ username: 'test', offset: 0 }))

      effects.loadFollowing$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.loadFollowingSuccess({ following: [userMock] })
        )
        done()
      })
    })

    it('should dispatch loadFollowingSuccess when usersService.getFollowingOfUser fails', (done) => {
      ;(usersService.getFollowingOfUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(UsersActions.loadFollowing({ username: 'test', offset: 0 }))

      effects.loadFollowing$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          UsersActions.loadFollowingFailure({ error: 'test error' })
        )
        done()
      })
    })
  })
})
