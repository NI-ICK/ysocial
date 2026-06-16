import { createReducer, on } from '@ngrx/store'
import { initialState } from './auth.state'
import * as AuthActions from './auth.actions'
import * as UsersActions from '../users/users.actions'
import { AuthStatus } from '../../utils/auth-status.enum'

export const authReducer = createReducer(
  initialState,
  on(AuthActions.loadUser, (state) => ({
    ...state,
    status: AuthStatus.LOADING,
  })),
  on(AuthActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    user,
    status: AuthStatus.AUTHENTICATED,
  })),
  on(AuthActions.loadUserFailure, (state) => ({
    ...state,
    user: null,
    status: AuthStatus.UNAUTHENTICATED,
  })),
  on(AuthActions.logoutUserSuccess, (state) => ({
    ...state,
    loginSuccess: false,
    registerSuccess: false,
    user: null,
    status: AuthStatus.UNAUTHENTICATED,
  })),
  on(AuthActions.loginUserSuccess, (state) => ({
    ...state,
    loginSuccess: true,
  })),
  on(AuthActions.registerUserSuccess, (state) => ({
    ...state,
    registerSuccess: true,
  })),
  on(UsersActions.updateUserProfileImage, (state, { preview }) => {
    if (!state.user) return state

    return {
      ...state,
      user: { ...state.user, imagePath: preview },
    }
  })
)
