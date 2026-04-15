import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import * as CommentActions from './comments.actions'
import {
  catchError,
  concat,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs'
import { Action, Store } from '@ngrx/store'
import { selectCurrentUser } from '../auth/auth.selectors'
import { v4 as uuid } from 'uuid'
import { Comment } from '../../utils/interfaces/comment.interface'
import { CommentsService } from '../../features/posts/comments/comments-service/comments.service'
import { PopupService } from '../../shared/popup/popup.service'
import {
  incrementCommentsCount,
  loadCurrentPostSuccess,
} from '../posts/posts.actions'

@Injectable()
export class CommentsEffects {
  constructor(
    private actions$: Actions,
    private store: Store,
    private commentsService: CommentsService,
    private popupService: PopupService
  ) {}

  loadCommentsAfterPost$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCurrentPostSuccess),
      map(({ post }) => CommentActions.loadComments({ postId: post.id }))
    )
  )

  loadComments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.loadComments),
      switchMap(({ postId }) =>
        this.commentsService.getCommentsByPostId(postId).pipe(
          map((result) =>
            CommentActions.loadCommentsSuccess({
              postId,
              comments: result.data?.getCommentsByPostId || [],
            })
          ),
          catchError((err) =>
            of(CommentActions.loadCommentsFailure({ error: err.message }))
          )
        )
      )
    )
  )

  createComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.createComment),
      switchMap(({ body, postId, parentId }) =>
        this.store.select(selectCurrentUser).pipe(
          take(1),
          switchMap((user) => {
            if (!user) {
              return of(
                CommentActions.createCommentFailure({
                  error: 'No user logged in',
                })
              )
            }
            const tmpId = `tmp-${uuid()}`

            const optimisticComment: Comment = {
              id: tmpId,
              postId,
              parent: parentId ? { id: parentId } : null,
              body,
              likesCount: 0,
              likedByMe: false,
              repliesCount: 0,
              createdAt: new Date().toISOString(),
              user: {
                id: user.id,
                username: user.username,
                imagePath: user.imagePath,
              },
            }

            return concat(
              of(
                CommentActions.createCommentSuccess({
                  comment: optimisticComment,
                  postId,
                  parentId,
                })
              ),
              this.commentsService.createComment(body, postId, parentId).pipe(
                mergeMap((result) => {
                  const realComment = result.data?.createComment
                  if (!realComment) throw new Error('Comment creation failed')

                  const actions: Action[] = [
                    CommentActions.replaceOptimisticComment({
                      tmpId,
                      comment: realComment,
                      parentId,
                    }),
                  ]

                  if (!parentId) {
                    actions.push(incrementCommentsCount({ postId }))
                  }

                  return from(actions)
                }),
                tap(() => this.popupService.showPopup('Comment created')),
                catchError((err) =>
                  from([
                    CommentActions.removeOptimisticComment({
                      tmpId,
                      parentId,
                      postId,
                    }),
                    CommentActions.createCommentFailure({ error: err.message }),
                  ])
                )
              )
            )
          })
        )
      )
    )
  )

  toggleCommentLike$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CommentActions.toggleCommentLike),
      switchMap(({ commentId }) =>
        this.commentsService.toggleCommentLike(commentId).pipe(
          map(() => CommentActions.toggleCommentLikeSuccess({ commentId })),
          catchError((err) =>
            of(CommentActions.toggleCommentLikeFailure({ error: err.message }))
          )
        )
      )
    )
  )
}
