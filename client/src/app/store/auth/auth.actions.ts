import { createAction, props } from '@ngrx/store'
import { User } from '../../utils/user.interface'

// ----- Login User -----
export const loginUser = createAction(
  '[Auth] Login User',
  props<{ email: string; password: string }>()
)
export const loginUserSuccess = createAction('[Auth] Login User Success')
export const loginUserFailure = createAction(
  '[Auth] Login User Failure',
  props<{ error: string }>()
)

export const registerUser = createAction(
  '[Auth] Register User',
  props<{
    username: string
    email: string
    password: string
  }>()
)
export const registerUserSuccess = createAction('[Auth] Register User Success')
export const registerUserFailure = createAction(
  '[Auth] Register User Failure',
  props<{ error: string }>()
)

// ----- Load User -----
export const loadUser = createAction('[Auth] Load User')
export const loadUserSuccess = createAction(
  '[Auth] Load User Success',
  props<{ user: User }>()
)
export const loadUserFailure = createAction(
  '[Auth] Load User Failure',
  props<{ error: string }>()
)

// ----- Logout User -----
export const logoutUser = createAction('[Auth] Logout User')
export const logoutUserSuccess = createAction('[Auth] Logout User Success')
export const logoutUserFailure = createAction(
  '[Auth] Logout User Failure',
  props<{ error: string }>()
)
