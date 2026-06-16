import { authReducer } from '../auth.reducer'
import { initialState } from '../auth.state'
import * as AuthActions from '../auth.actions'
import * as UsersActions from '../../users/users.actions'
import { AuthStatus } from '../../../utils/auth-status.enum'
import { User } from '../../../utils/interfaces/user.interface'

describe('Auth Reducer', () => {
  const mockUser = {
    id: '1',
    username: 'test',
    imagePath: 'test',
  } as User

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  describe('loadUser', () => {
    it('should set status to loading on loadUser', () => {
      const state = authReducer(initialState, AuthActions.loadUser())

      expect(state.status).toEqual(AuthStatus.LOADING)
    })

    it('should set current user and status on loadUserSuccess', () => {
      const state = authReducer(
        initialState,
        AuthActions.loadUserSuccess({ user: mockUser })
      )

      expect(state.user).toEqual(mockUser)
      expect(state.status).toEqual(AuthStatus.AUTHENTICATED)
    })

    it('should set current user and status on loadUserFailure', () => {
      const state = authReducer(
        initialState,
        AuthActions.loadUserFailure({ error: 'test error' })
      )

      expect(state.user).toEqual(null)
      expect(state.status).toEqual(AuthStatus.UNAUTHENTICATED)
    })
  })

  describe('logoutUser', () => {
    it('should set status, current user, loginSuccess and registerSuccess on logoutUserSuccess', () => {
      const state = authReducer(initialState, AuthActions.logoutUserSuccess())

      expect(state.user).toEqual(null)
      expect(state.status).toEqual(AuthStatus.UNAUTHENTICATED)
      expect(state.loginSuccess).toEqual(false)
      expect(state.registerSuccess).toEqual(false)
    })
  })

  describe('loginUser', () => {
    it('should set loginSuccess on loginUserSuccess', () => {
      const state = authReducer(initialState, AuthActions.loginUserSuccess())

      expect(state.loginSuccess).toEqual(true)
    })
  })

  describe('registerUser', () => {
    it('should set registerSuccess on registerUserSuccess', () => {
      const state = authReducer(initialState, AuthActions.registerUserSuccess())

      expect(state.registerSuccess).toEqual(true)
    })
  })

  describe('updateUserProfileImage', () => {
    it('should return state if user is null', () => {
      const file = new File(['content'], 'file')
      const state = authReducer(
        initialState,
        UsersActions.updateUserProfileImage({
          image: file,
          preview: 'preview-data',
        })
      )

      expect(state).toEqual(initialState)
    })

    it('should update imagePath if user exists', () => {
      const file = new File(['content'], 'file')
      const state = authReducer(
        { ...initialState, user: mockUser },
        UsersActions.updateUserProfileImage({
          image: file,
          preview: 'preview-data',
        })
      )

      expect(state.user?.imagePath).toEqual('preview-data')
    })
  })
})
