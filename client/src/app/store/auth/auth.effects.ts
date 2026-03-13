import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import * as AuthActions from './auth.actions'
import { catchError, map, of, switchMap, tap } from 'rxjs'
import { AuthService } from '../../features/auth/auth-service/auth.service'
import { PopupService } from '../../shared/popup/popup.service'

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private popupService: PopupService
  ) {}

  loginUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginUser),
      switchMap(({ email, password }) =>
        this.authService.loginUser(email, password).pipe(
          switchMap(() => [
            AuthActions.loginUserSuccess(),
            AuthActions.loadUser(),
          ]),
          catchError((err) =>
            of(AuthActions.loginUserFailure({ error: err.message }))
          )
        )
      )
    )
  )

  loginUserSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginUserSuccess),
        tap(() => this.popupService.showPopup('Sign In Successfull'))
      ),
    { dispatch: false }
  )

  loginUserFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginUserFailure),
        tap(({ error }) =>
          this.popupService.showPopup(error || 'Sign In Failed')
        )
      ),
    { dispatch: false }
  )

  registerUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerUser),
      switchMap(({ username, email, password }) =>
        this.authService.registerUser(username, email, password).pipe(
          map(() => AuthActions.registerUserSuccess()),
          catchError((err) =>
            of(AuthActions.registerUserFailure({ error: err.message }))
          )
        )
      )
    )
  )

  registerUserSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerUserSuccess),
        tap(() => this.popupService.showPopup('Sign Up Successfull'))
      ),
    { dispatch: false }
  )

  registerUserFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerUserFailure),
        tap(({ error }) =>
          this.popupService.showPopup(error || 'Sign Up Failed')
        )
      ),
    { dispatch: false }
  )

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUser),
      switchMap(() =>
        this.authService.getCurrentUser().pipe(
          map((res) => {
            const user = res.data?.getCurrentUser
            if (!user) throw new Error('User not found')
            return AuthActions.loadUserSuccess({ user })
          }),
          catchError((err) =>
            of(AuthActions.loadUserFailure({ error: err.message }))
          )
        )
      )
    )
  )

  logoutUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutUser),
      switchMap(() =>
        this.authService.logoutUser().pipe(
          map(() => AuthActions.logoutUserSuccess()),
          catchError((err) =>
            of(AuthActions.logoutUserFailure({ error: err.message }))
          )
        )
      )
    )
  )
}
