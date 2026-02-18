import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { PopupService } from '../../shared/popup/popup.service'
import * as PostsActions from './posts.actions'
import { catchError, map, of, switchMap, take, tap } from 'rxjs'
import { PostsService } from '../../features/posts/posts-service/posts.service'
import { Store } from '@ngrx/store'
import { selectCurrentUser } from '../auth/auth.selectors'

@Injectable()
export class PostsEffects {
  constructor(
    private actions$: Actions,
    private postsService: PostsService,
    private popupService: PopupService,
    private store: Store
  ) {}

  loadPosts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PostsActions.loadPosts),
      switchMap(() =>
        this.postsService.getAllPosts().pipe(
          map((result) =>
            PostsActions.loadPostsSuccess({
              posts: result.data?.getAllPosts || [],
            })
          ),
          catchError((err) =>
            of(PostsActions.loadPostsFailure({ error: err.message }))
          )
        )
      )
    )
  )

  createPost$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PostsActions.createPost),
      switchMap(({ body, file }) =>
        this.store.select(selectCurrentUser).pipe(
          take(1),
          switchMap((user) => {
            if (!user)
              return of(
                PostsActions.createPostFailure({ error: 'No user logged in' })
              )
            return this.postsService.createPost(user?.id, body, file).pipe(
              map((result) => {
                const post = result.data?.createPost
                if (!post) throw new Error('Post creation failed')
                return PostsActions.createPostSuccess({ post })
              })
            )
          }),
          tap(() => this.popupService.showPopup('Post created')),
          catchError((err) =>
            of(PostsActions.createPostFailure({ error: err.message }))
          )
        )
      )
    )
  )
}
