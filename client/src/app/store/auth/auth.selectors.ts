import { createFeatureSelector, createSelector } from '@ngrx/store'
import { AuthState } from './auth.state'

export const selectAuthState = createFeatureSelector<AuthState>('auth')

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.user
)

export const selectAuthStatus = createSelector(
  selectAuthState,
  (state) => state.status
)

export const selectLoginSuccess = createSelector(
  selectAuthState,
  (state) => state.loginSuccess
)

export const selectRegisterSuccess = createSelector(
  selectAuthState,
  (state) => state.registerSuccess
)
