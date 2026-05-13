import { Actions } from '@ngrx/effects'
import { PopupService } from '../../../shared/popup/popup.service'
import { AuthService } from '../../../features/auth/auth-service/auth.service'
import { TestBed } from '@angular/core/testing'
import { provideMockActions } from '@ngrx/effects/testing'
import { AuthEffects } from '../auth.effects'
import { User } from '../../../utils/interfaces/user.interface'
import * as AuthActions from '../auth.actions'
import * as PostsActions from '../../posts/posts.actions'
import * as CommentsActions from '../../comments/comments.actions'
import { of, take, throwError, toArray } from 'rxjs'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { selectCurrentPostId } from '../../posts/posts.selectors'

describe('Auth Effects', () => {
  let actions$: Actions
  let effects: AuthEffects
  let authService: Partial<AuthService>
  let popupService: Partial<PopupService>
  let mockStore: MockStore

  const mockUser = {
    id: '1',
    username: 'test',
    email: 'test@gmail.com',
  } as User

  beforeEach(() => {
    authService = {
      loginUser: jest.fn(),
      registerUser: jest.fn(),
      getCurrentUser: jest.fn(),
      logoutUser: jest.fn(),
    }
    popupService = {
      showPopup: jest.fn(),
    }

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        { provide: AuthService, useValue: authService },
        { provide: PopupService, useValue: popupService },
        provideMockActions(() => actions$),
        provideMockStore(),
      ],
    })

    effects = TestBed.inject(AuthEffects)
    mockStore = TestBed.inject(MockStore)

    mockStore.overrideSelector(selectCurrentPostId, '1')
  })

  describe('loginUser', () => {
    it('should dispatch loginUserSuccess and loadUser when authService.loginUser succeeds', (done) => {
      ;(authService.loginUser as jest.Mock).mockReturnValue(
        of({ data: { loginUserData: mockUser } })
      )

      actions$ = of(
        AuthActions.loginUser({ email: 'test@gmail.com', password: 'test' })
      )

      effects.loginUser$.pipe(toArray()).subscribe((actions) => {
        const login = actions[0] as ReturnType<
          typeof AuthActions.loginUserSuccess
        >
        const load = actions[1] as ReturnType<typeof AuthActions.loadUser>

        expect(login.type).toEqual('[Auth] Login User Success')
        expect(load.type).toEqual('[Auth] Load User')

        done()
      })
    })

    it('should dispatch loginUserFailure when authService.loginUser fails', (done) => {
      ;(authService.loginUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(
        AuthActions.loginUser({ email: 'test@gmail.com', password: 'test' })
      )

      effects.loginUser$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          AuthActions.loginUserFailure({ error: 'test error' })
        )
        done()
      })
    })

    describe('loginUserSuccess', () => {
      it('should dispatch only loadPosts if currentPostId is null', (done) => {
        mockStore.overrideSelector(selectCurrentPostId, null)
        mockStore.refreshState()

        actions$ = of(AuthActions.loginUserSuccess())

        effects.loginUserSuccess$.pipe(take(1)).subscribe((action) => {
          expect(action).toEqual(PostsActions.loadPosts({ offset: 0 }))
          done()
        })
      })

      it('should dispatch loadPosts and loadComments', (done) => {
        actions$ = of(AuthActions.loginUserSuccess())

        effects.loginUserSuccess$.pipe(toArray()).subscribe((actions) => {
          expect(actions[0]).toEqual(PostsActions.loadPosts({ offset: 0 }))
          expect(actions[1]).toEqual(
            CommentsActions.loadComments({ postId: '1' })
          )
          done()
        })
      })

      it('should call popupService', (done) => {
        actions$ = of(AuthActions.loginUserSuccess())

        effects.loginUserSuccess$.pipe(take(1)).subscribe(() => {
          expect(popupService.showPopup).toHaveBeenCalledWith(
            'Sign In Successfull'
          )
          done()
        })
      })
    })

    describe('loginUserFailure', () => {
      it('should call popupService', (done) => {
        actions$ = of(AuthActions.loginUserFailure({ error: 'test error' }))

        effects.loginUserFailure$.pipe(take(1)).subscribe(() => {
          expect(popupService.showPopup).toHaveBeenCalledWith('test error')
          done()
        })
      })
    })
  })

  describe('registerUser', () => {
    it('should dispatch registerUserSuccess when authService.registerUser succeeds', (done) => {
      ;(authService.registerUser as jest.Mock).mockReturnValue(
        of({ data: { registerUserData: mockUser } })
      )

      actions$ = of(
        AuthActions.registerUser({
          username: 'test',
          email: 'test@gmail.com',
          password: 'test',
        })
      )

      effects.registerUser$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(AuthActions.registerUserSuccess())
        done()
      })
    })

    it('should dispatch registerUserFailure when authService.registerUser fails', (done) => {
      ;(authService.registerUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(
        AuthActions.registerUser({
          username: 'test',
          email: 'test@gmail.com',
          password: 'test',
        })
      )

      effects.registerUser$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          AuthActions.registerUserFailure({ error: 'test error' })
        )
        done()
      })
    })

    describe('registerUserSuccess', () => {
      it('should call popupService', (done) => {
        actions$ = of(AuthActions.registerUserSuccess())

        effects.registerUserSuccess$.pipe(take(1)).subscribe(() => {
          expect(popupService.showPopup).toHaveBeenCalledWith(
            'Sign Up Successfull'
          )
          done()
        })
      })
    })

    describe('registerUserFailure', () => {
      it('should call popupService', (done) => {
        actions$ = of(AuthActions.registerUserFailure({ error: 'test error' }))

        effects.registerUserFailure$.pipe(take(1)).subscribe(() => {
          expect(popupService.showPopup).toHaveBeenCalledWith('test error')
          done()
        })
      })
    })
  })

  describe('loadUser', () => {
    it('should dispatch loadUserSuccess when authService.getCurrentUser succeeds', (done) => {
      ;(authService.getCurrentUser as jest.Mock).mockReturnValue(
        of({ data: { getCurrentUser: mockUser } })
      )

      actions$ = of(AuthActions.loadUser())

      effects.loadUser$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(AuthActions.loadUserSuccess({ user: mockUser }))
        done()
      })
    })

    it('should dispatch loadUserFailure when authService.getCurrentUser returns null', (done) => {
      ;(authService.getCurrentUser as jest.Mock).mockReturnValue(
        of({ data: { getCurrentUser: null } })
      )

      actions$ = of(AuthActions.loadUser())

      effects.loadUser$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          AuthActions.loadUserFailure({ error: 'User not found' })
        )
        done()
      })
    })

    it('should dispatch loadUserFailure when authService.getCurrentUser fails', (done) => {
      ;(authService.getCurrentUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(AuthActions.loadUser())

      effects.loadUser$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          AuthActions.loadUserFailure({ error: 'test error' })
        )
        done()
      })
    })
  })

  describe('logoutUser', () => {
    it('should dispatch logoutUserSuccess when authService.logoutUser succeeds', (done) => {
      ;(authService.logoutUser as jest.Mock).mockReturnValue(
        of({ data: { logoutUser: { success: true } } })
      )

      actions$ = of(AuthActions.logoutUser())

      effects.logoutUser$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(AuthActions.logoutUserSuccess())
        done()
      })
    })

    it('should dispatch logoutUserFailure when authService.getCurrentUser fails', (done) => {
      ;(authService.logoutUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(AuthActions.logoutUser())

      effects.logoutUser$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          AuthActions.logoutUserFailure({ error: 'test error' })
        )
        done()
      })
    })
  })
})
