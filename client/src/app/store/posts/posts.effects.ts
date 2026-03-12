import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { PopupService } from '../../shared/popup/popup.service'
import * as PostsActions from './posts.actions'
import {
  catchError,
  concat,
  exhaustMap,
  filter,
  from,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs'
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
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
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

  loadCurrentPost$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PostsActions.loadCurrentPost),
      switchMap(({ id }) =>
        this.postsService.getPostById(id).pipe(
          map((result) => {
            const post = result.data?.getPostById
            if (!post) throw new Error('Failed to load post')

            return PostsActions.loadCurrentPostSuccess({
              post,
            })
          }),
          catchError((err) =>
            of(PostsActions.loadCurrentPostFailure({ error: err.message }))
          )
        )
      )
    )
  )

  deletePost$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PostsActions.deletePost),
      exhaustMap(({ post }) =>
        this.postsService.deletePost(post.id).pipe(
          map(() => PostsActions.deletePostSuccess()),
          catchError((err) =>
            of(
              PostsActions.deletePostFailure({
                error: err.message,
                post: post,
              })
            )
          )
        )
      )
    )
  )

  deletePostSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PostsActions.deletePostSuccess),
        tap(() => this.popupService.showPopup('Post Deleted Successfully'))
      ),
    { dispatch: false }
  )

  deletePostFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PostsActions.deletePostFailure),
        tap(() => this.popupService.showPopup('Failed to Delete Post'))
      ),
    { dispatch: false }
  )

  editPost$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PostsActions.editPost),
      switchMap(({ id, body, prevBody }) =>
        this.postsService.editPost(id, body).pipe(
          map((result) => result.data?.editPost),
          filter((post): post is Post => !!post),
          map((post) => PostsActions.editPostSuccess({ post })),
          catchError((err) =>
            of(
              PostsActions.editPostFailure({ error: err.message, prevBody, id })
            )
          )
        )
      )
    )
  )

  editPostSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PostsActions.editPostSuccess),
        tap(() => this.popupService.showPopup('Post Edited Successfully'))
      ),
    { dispatch: false }
  )

  editPostFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PostsActions.editPostFailure),
        tap(() => this.popupService.showPopup('Failed to Edit Post'))
      ),
    { dispatch: false }
  )
}
