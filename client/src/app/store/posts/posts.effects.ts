import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { AuthService } from '../../features/auth/auth-service/auth.service'
import { PopupService } from '../../shared/popup/popup.service'
import * as PostsActions from './posts.actions'
import { catchError, map, of, switchMap, tap } from 'rxjs'
import { Post } from '../../utils/post.interface'
import { PostsService } from '../../features/posts/posts-service/posts.service'

interface GetAllPostsResponse {
  getAllPosts: Post[]
}

interface CreatePostResponse {
  createPost: Post
}

@Injectable()
export class PostsEffects {
  constructor(
    private actions$: Actions,
    private postsService: PostsService,
    private authService: AuthService,
    private popupService: PopupService
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
        this.authService.getCurrentUser().pipe(
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
