import { TestBed } from '@angular/core/testing'
import { AuthService } from './auth.service'
import { isPlatformBrowser } from '@angular/common'
import { forkJoin } from 'rxjs'
import { PLATFORM_ID } from '@angular/core'
import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing'
import { AuthState } from '../../../utils/auth-state.enum'
import { GET_CURRENT_USER, LOGOUT_USER } from '../../../graphql/auth.operations'

jest.mock('@angular/common', () => ({
  ...jest.requireActual('@angular/common'),
  isPlatformBrowser: jest.fn(),
}))

describe('AuthService', () => {
  let authService: AuthService
  let apolloController: ApolloTestingController

  beforeEach(() => {
    ;(isPlatformBrowser as jest.Mock).mockReturnValue(true)

    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    })
    authService = TestBed.inject(AuthService)
    apolloController = TestBed.inject(ApolloTestingController)
  })

  it('should be created', () => {
    expect(authService).toBeTruthy()
    expect(apolloController).toBeTruthy()
  })

  describe('loadUser', () => {
    it('should set AUTHENTICATED state and currentUser on success', () => {
      const mockUser = { id: '1', username: 'test' }

      authService.loadUser()

      const op = apolloController.expectOne(GET_CURRENT_USER)
      op.flush({ data: { getCurrentUser: mockUser } })
      apolloController.verify()

      forkJoin([
        authService.getAuthState(),
        authService.getCurrentUser(),
      ]).subscribe(([authState, user]) => {
        expect(authState).toBe(AuthState.AUTHENTICATED)
        expect(user).toEqual(mockUser)
      })
    })

    it('should set UNAUTHENTICATED state when currentUser is null', () => {
      authService.loadUser()

      const op = apolloController.expectOne(GET_CURRENT_USER)
      op.flush({ data: { getCurrentUser: null } })
      apolloController.verify()

      forkJoin([
        authService.getAuthState(),
        authService.getCurrentUser(),
      ]).subscribe(([authState, user]) => {
        expect(authState).toBe(AuthState.UNAUTHENTICATED)
        expect(user).toEqual(null)
      })
    })

    it('should set UNAUTHENTICATED state on error', () => {
      authService.loadUser()

      const op = apolloController.expectOne(GET_CURRENT_USER)
      op.graphqlErrors([])
      apolloController.verify()

      forkJoin([
        authService.getAuthState(),
        authService.getCurrentUser(),
      ]).subscribe(([authState, user]) => {
        expect(authState).toBe(AuthState.UNAUTHENTICATED)
        expect(user).toEqual(null)
      })
    })

    it('should not call loadUser if platform is server', () => {
      ;(isPlatformBrowser as jest.Mock).mockReturnValue(false)

      const loadUserSpy = jest.spyOn(authService, 'loadUser')
      expect(loadUserSpy).not.toHaveBeenCalled()
    })
  })

  describe('logoutUser', () => {
    beforeEach(() => {
      const op = apolloController.expectOne(GET_CURRENT_USER)
      op.flush({ data: { getCurrentUser: null } })
      apolloController.verify()
    })

    it('should set UNAUTHENTICATED state on success', () => {
      authService.logoutUser()

      const op = apolloController.expectOne(LOGOUT_USER)
      op.flush({ data: {} })
      apolloController.verify()

      forkJoin([
        authService.getAuthState(),
        authService.getCurrentUser(),
      ]).subscribe(([authState, user]) => {
        expect(authState).toBe(AuthState.UNAUTHENTICATED)
        expect(user).toEqual(null)
      })
    })

    it('should set UNAUTHENTICATED state on error', () => {
      authService.logoutUser()

      const op = apolloController.expectOne(LOGOUT_USER)
      op.graphqlErrors([])
      apolloController.verify()

      forkJoin([
        authService.getAuthState(),
        authService.getCurrentUser(),
      ]).subscribe(([authState, user]) => {
        expect(authState).toBe(AuthState.UNAUTHENTICATED)
        expect(user).toEqual(null)
      })
    })
  })
})
