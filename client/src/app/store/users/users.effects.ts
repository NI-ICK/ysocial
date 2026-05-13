import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import * as UsersActions from './users.actions'
import { catchError, concatMap, map, mergeMap, of, switchMap } from 'rxjs'
import { UsersService } from '../../features/users/users-service/users.service'

@Injectable()
export class UsersEffects {
  constructor(private actions$: Actions, private usersService: UsersService) {}

  loadUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUserProfile),
      switchMap(({ username }) =>
        this.usersService.getUserByUsername(username).pipe(
          map((result) => {
            const profile = result.data?.getUserByUsername
            if (!profile) throw new Error('Failed to load user profile')

            return UsersActions.loadUserProfileSuccess({
              userProfile: profile,
            })
          }),
          catchError((err) =>
            of(UsersActions.loadUserProfileFailure({ error: err.message }))
          )
        )
      )
    )
  )

  loadUserProfileSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadUserProfileSuccess),
      mergeMap(({ userProfile }) => [
        UsersActions.clearCreatedPosts(),
        UsersActions.clearLikedPosts(),
        UsersActions.loadCreatedPosts({ userId: userProfile.id, offset: 0 }),
        UsersActions.loadLikedPosts({ userId: userProfile.id, offset: 0 }),
      ])
    )
  )

  loadCreatedPosts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadCreatedPosts),
      concatMap(({ userId, offset }) =>
        this.usersService.getPostsCreatedByUser(userId, offset).pipe(
          map((result) =>
            UsersActions.loadCreatedPostsSuccess({
              createdPosts: result.data?.getPostsCreatedByUser || [],
            })
          ),
          catchError((err) =>
            of(UsersActions.loadCreatedPostsFailure({ error: err.message }))
          )
        )
      )
    )
  )

  loadLikedPosts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadLikedPosts),
      concatMap(({ userId, offset }) =>
        this.usersService.getPostsLikedByUser(userId, offset).pipe(
          map((result) =>
            UsersActions.loadLikedPostsSuccess({
              likedPosts: result.data?.getPostsLikedByUser || [],
            })
          ),
          catchError((err) =>
            of(UsersActions.loadLikedPostsFailure({ error: err.message }))
          )
        )
      )
    )
  )

  toggleFollow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.toggleFollow),
      switchMap(({ userId }) =>
        this.usersService.toggleFollow(userId).pipe(
          map((result) => {
            const value = result.data?.toggleFollow?.followed
            if (value === undefined || value === null)
              throw new Error('Empty response')

            return UsersActions.toggleFollowSuccess({
              followed: value,
              userId,
            })
          })
        )
      ),
      catchError((err) =>
        of(UsersActions.toggleFollowFailure({ error: err.message }))
      )
    )
  )

  loadFollowers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadFollowers),
      concatMap(({ username, offset }) =>
        this.usersService.getFollowersOfUser(username, offset).pipe(
          map((result) =>
            UsersActions.loadFollowersSuccess({
              followers: result.data?.getFollowersOfUser || [],
            })
          ),
          catchError((err) =>
            of(UsersActions.loadFollowersFailure({ error: err.message }))
          )
        )
      )
    )
  )

  loadFollowing$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.loadFollowing),
      concatMap(({ username, offset }) =>
        this.usersService.getFollowingOfUser(username, offset).pipe(
          map((result) =>
            UsersActions.loadFollowingSuccess({
              following: result.data?.getFollowingOfUser || [],
            })
          ),
          catchError((err) =>
            of(UsersActions.loadFollowingFailure({ error: err.message }))
          )
        )
      )
    )
  )
}
