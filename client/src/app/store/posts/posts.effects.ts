import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { PopupService } from '../../shared/popup/popup.service'
import * as PostsActions from './posts.actions'
import { catchError, concat, from, map, of, switchMap, take, tap } from 'rxjs'
import { PostsService } from '../../features/posts/posts-service/posts.service'
import { Store } from '@ngrx/store'
import { selectCurrentUser } from '../auth/auth.selectors'
import { v4 as uuid } from 'uuid'
import { Post } from '../../utils/post.interface'

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
            if (!user) {
              return of(
                PostsActions.createPostFailure({ error: 'No user logged in' })
              )
            }

            const tmpId = `tmp-${uuid()}`

            const optimisticPost: Post = {
              id: tmpId,
              body,
              image: file ? URL.createObjectURL(file) : null,
              imagePublicId: '123',
              user: {
                id: user.id,
                username: user.username,
                imagePath: user.imagePath,
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            }

            return concat(
              of(PostsActions.createPostSuccess({ post: optimisticPost })),

              this.postsService.createPost(user.id, body, file).pipe(
                map((result) => {
                  const realPost = result.data?.createPost
                  if (!realPost) throw new Error('Post creation failed')

                  return PostsActions.replaceOptimisticPost({
                    tmpId,
                    post: realPost,
                  })
                }),
                tap(() => this.popupService.showPopup('Post created')),
                catchError((err) =>
                  from([
                    PostsActions.removeOptimisticPost({ tmpId }),
                    PostsActions.createPostFailure({ error: err.message }),
                  ])
                )
              )
            )
          })
        )
      )
    )
  )
}
