import { Actions } from '@ngrx/effects'
import { PopupService } from '../../../shared/popup/popup.service'
import { AuthService } from '../../../features/auth/auth-service/auth.service'
import { TestBed } from '@angular/core/testing'
import { provideMockActions } from '@ngrx/effects/testing'
import { AuthEffects } from '../auth.effects'
import { User } from '../../../utils/user.interface'
import * as AuthActions from '../auth.actions'
import { of, throwError } from 'rxjs'

describe('Auth Effects', () => {
  let actions$: Actions
  let effects: AuthEffects
  let authService: Partial<AuthService>
  let popupService: Partial<PopupService>

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
        { provice: PopupService, useValue: popupService },
        provideMockActions(() => actions$),
      ],
    })

    effects = TestBed.inject(AuthEffects)
  })

  describe('loginUser', () => {
    it('should dispatch loginUserSuccess and loadUser when authService.loginUser succeeds', () => {
      ;(authService.loginUser as jest.Mock).mockReturnValue(of(mockUser))

      actions$ = of(
        AuthActions.loginUser({ email: 'test@gmail.com', password: 'test' })
      )

      effects.loginUser$.subscribe((actions) =>
        expect(actions).toEqual([
          AuthActions.loginUserSuccess(),
          AuthActions.loadUser(),
        ])
      )
    })

    it('should dispatch loginUserFailure when authService.loginUser fails', () => {
      ;(authService.loginUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(
        AuthActions.loginUser({ email: 'test@gmail.com', password: 'test' })
      )

      effects.loadUser$.subscribe((action) =>
        expect(action).toEqual(
          AuthActions.loginUserFailure({ error: 'test error' })
        )
      )
    })

    describe('loginUserSuccess', () => {
      it('should call popupService', () => {
        actions$ = of(AuthActions.loginUserSuccess())

        effects.loginUserSuccess$.subscribe(() => {
          expect(popupService.showPopup).toHaveBeenCalledWith(
            'Sign In Successfull'
          )
        })
      })
    })

    describe('loginUserFailure', () => {
      it('should call popupService', () => {
        actions$ = of(AuthActions.loginUserFailure({ error: 'test error' }))

        effects.loginUserFailure$.subscribe(() => {
          expect(popupService.showPopup).toHaveBeenCalledWith('test error')
        })
      })
    })
  })

  describe('registerUser', () => {
    it('should dispatch registerUserSuccess when authService.registerUser succeeds', () => {
      ;(authService.registerUser as jest.Mock).mockReturnValue(of(mockUser))

      actions$ = of(
        AuthActions.registerUser({
          username: 'test',
          email: 'test@gmail.com',
          password: 'test',
        })
      )

      effects.registerUser$.subscribe((action) => {
        expect(action).toEqual(AuthActions.registerUserSuccess())
      })
    })

    it('should dispatch registerUserFailure when authService.registerUser fails', () => {
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

      effects.registerUser$.subscribe((action) => {
        expect(action).toEqual(
          AuthActions.registerUserFailure({ error: 'test error' })
        )
      })
    })

    describe('registerUserSuccess', () => {
      it('should call popupService', () => {
        actions$ = of(AuthActions.registerUserSuccess())

        effects.registerUserSuccess$.subscribe(() => {
          expect(popupService.showPopup).toHaveBeenCalledWith(
            'Sign Up Successfull'
          )
        })
      })
    })

    describe('registerUserFailure', () => {
      it('should call popupService', () => {
        actions$ = of(AuthActions.registerUserFailure({ error: 'test error' }))

        effects.registerUserFailure$.subscribe(() => {
          expect(popupService.showPopup).toHaveBeenCalledWith('test error')
        })
      })
    })
  })

  describe('loadUser', () => {
    it('should dispatch loadUserSuccess when authService.getCurrentUser succeeds', () => {
      ;(authService.getCurrentUser as jest.Mock).mockReturnValue(of(mockUser))

      actions$ = of(AuthActions.loadUser())

      effects.loadUser$.subscribe((action) => {
        expect(action).toEqual(AuthActions.loadUserSuccess({ user: mockUser }))
      })
    })

    it('should dispatch loadUserFailure when authService.getCurrentUser returns null', () => {
      ;(authService.getCurrentUser as jest.Mock).mockReturnValue(of(null))

      actions$ = of(AuthActions.loadUser())

      effects.loadUser$.subscribe((action) => {
        expect(action).toEqual(
          AuthActions.loadUserFailure({ error: 'User not found' })
        )
      })
    })

    it('should dispatch loadUserFailure when authService.getCurrentUser fails', () => {
      ;(authService.getCurrentUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(AuthActions.loadUser())

      effects.loadUser$.subscribe((action) => {
        expect(action).toEqual(
          AuthActions.loadUserFailure({ error: 'test error' })
        )
      })
    })
  })

  describe('logoutUser', () => {
    it('should dispatch logoutUserSuccess when authService.logoutUser succeeds', () => {
      ;(authService.getCurrentUser as jest.Mock).mockReturnValue(of(mockUser))

      actions$ = of(AuthActions.logoutUser())

      effects.logoutUser$.subscribe((action) => {
        expect(action).toEqual(AuthActions.logoutUserSuccess())
      })
    })

    it('should dispatch logoutUserFailure when authService.getCurrentUser fails', () => {
      ;(authService.getCurrentUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(AuthActions.loadUser())

      effects.loadUser$.subscribe((action) => {
        expect(action).toEqual(
          AuthActions.logoutUserFailure({ error: 'test error' })
        )
      })
    })
  })
})
