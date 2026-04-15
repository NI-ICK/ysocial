import { TestBed } from '@angular/core/testing'
import { CommentsEffects } from '../comments.effects'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { provideMockActions } from '@ngrx/effects/testing'
import { PopupService } from '../../../shared/popup/popup.service'
import { CommentsService } from '../../../features/posts/comments/comments-service/comments.service'
import { Actions } from '@ngrx/effects'
import * as CommentsActions from '../comments.actions'
import { loadCurrentPostSuccess } from '../../posts/posts.actions'
import { of, throwError, toArray } from 'rxjs'
import { Post } from '../../../utils/interfaces/post.interface'
import { Comment } from '../../../utils/interfaces/comment.interface'
import { selectCurrentUser } from '../../auth/auth.selectors'
import { User } from '../../../utils/interfaces/user.interface'

describe('Comments Effects', () => {
  let actions$: Actions
  let effects: CommentsEffects
  let store: MockStore
  let popupService: Partial<PopupService>
  let commentsService: Partial<CommentsService>

  const mockComment = { id: '2', body: 'test' } as Comment

  beforeEach(() => {
    popupService = {
      showPopup: jest.fn(),
    }
    commentsService = {
      getCommentsByPostId: jest.fn(),
      createComment: jest.fn(),
      toggleCommentLike: jest.fn(),
    }

    TestBed.configureTestingModule({
      providers: [
        CommentsEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: PopupService, useValue: popupService },
        { provide: CommentsService, useValue: commentsService },
      ],
    })
    effects = TestBed.inject(CommentsEffects)
    store = TestBed.inject(MockStore)

    store.overrideSelector(selectCurrentUser, {
      id: '5',
      username: 'test',
    } as User)
  })

  describe('loadCommentsAfterPost', () => {
    it('should dispatch loadComments on loadCurrentPostSuccess', (done) => {
      const mockPost = { id: '1', body: 'test' } as Post
      actions$ = of(loadCurrentPostSuccess({ post: mockPost }))

      effects.loadCommentsAfterPost$.subscribe((action) => {
        expect(action).toEqual(CommentsActions.loadComments({ postId: '1' }))
        done()
      })
    })
  })

  describe('loadComments', () => {
    it('should dispatch loadCommentsSuccess when commentsService.getCommentsByPostId succedes', (done) => {
      ;(commentsService.getCommentsByPostId as jest.Mock).mockReturnValue(
        of({ data: { getCommentsByPostId: [mockComment] } })
      )

      actions$ = of(CommentsActions.loadComments({ postId: '1' }))

      effects.loadComments$.subscribe((action) => {
        expect(action).toEqual(
          CommentsActions.loadCommentsSuccess({
            postId: '1',
            comments: [mockComment],
          })
        )
        done()
      })
    })

    it('should dispatch loadCommentsFailure when commentsService.getCommentsByPostId fails', (done) => {
      ;(commentsService.getCommentsByPostId as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(CommentsActions.loadComments({ postId: '1' }))

      effects.loadComments$.subscribe((action) => {
        expect(action).toEqual(
          CommentsActions.loadCommentsFailure({ error: 'test error' })
        )
        done()
      })
    })
  })

  describe('createComment', () => {
    it('should dispatch createCommentSuccess and replaceOptimisticComment then call popupService when commentsService.createComment succeeds', (done) => {
      ;(commentsService.createComment as jest.Mock).mockReturnValue(
        of({ data: { createComment: mockComment } })
      )

      actions$ = of(
        CommentsActions.createComment({
          body: 'test',
          postId: '1',
          parentId: null,
        })
      )

      effects.createComment$.pipe(toArray()).subscribe((actions) => {
        const optimistic = actions[0] as ReturnType<
          typeof CommentsActions.createCommentSuccess
        >
        const replace = actions[1] as ReturnType<
          typeof CommentsActions.replaceOptimisticComment
        >

        expect(optimistic.type).toEqual('[Comments] Create Comment Success')
        expect(replace.type).toEqual('[Comments] Replace Optimistic Comment')

        expect(optimistic.comment).toEqual(
          expect.objectContaining({
            body: 'test',
            id: expect.stringMatching(/^tmp-/),
          })
        )
        expect(replace).toEqual(
          CommentsActions.replaceOptimisticComment({
            tmpId: optimistic.comment.id,
            comment: mockComment,
            parentId: null,
          })
        )

        expect(popupService.showPopup).toHaveBeenCalled()
        done()
      })
    })

    it('should dispatch createCommentFailure and removeOptimisticComment when commentsService.createComment fails', (done) => {
      ;(commentsService.createComment as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(
        CommentsActions.createComment({
          body: 'test',
          postId: '1',
          parentId: null,
        })
      )

      effects.createComment$.pipe(toArray()).subscribe((actions) => {
        const optimistic = actions[0] as ReturnType<
          typeof CommentsActions.createCommentSuccess
        >
        const remove = actions[1] as ReturnType<
          typeof CommentsActions.removeOptimisticComment
        >
        const createFailure = actions[2] as ReturnType<
          typeof CommentsActions.createCommentFailure
        >

        expect(optimistic.type).toEqual('[Comments] Create Comment Success')
        expect(optimistic.comment.body).toEqual('test')

        expect(remove.type).toEqual('[Comments] Remove Optimistic Comment')
        expect(remove.tmpId).toMatch(/^tmp-/)

        expect(createFailure.type).toEqual('[Comments] Create Comment Failure')
        expect(createFailure.error).toEqual('test error')

        done()
      })
    })

    it('should dispatch createCommentFailure if no user logged in', (done) => {
      store.overrideSelector(selectCurrentUser, null)

      actions$ = of(
        CommentsActions.createComment({
          body: 'test',
          postId: '1',
          parentId: null,
        })
      )

      effects.createComment$.subscribe((action) => {
        expect(action).toEqual(
          CommentsActions.createCommentFailure({ error: 'No user logged in' })
        )
        done()
      })
    })
  })

  describe('toggleCommentLike', () => {
    it('should dispatch toggleCommentLikeSuccess when commentsService.toggleCommentLike succeeds', (done) => {
      ;(commentsService.toggleCommentLike as jest.Mock).mockReturnValue(
        of({ data: { toggleCommentLike: { addLike: true } } })
      )

      actions$ = of(CommentsActions.toggleCommentLike({ commentId: '2' }))

      effects.toggleCommentLike$.subscribe((action) => {
        expect(action).toEqual(
          CommentsActions.toggleCommentLikeSuccess({ commentId: '2' })
        )

        done()
      })
    })

    it('should dispatch toggleCommentLikeFailure when commentsService.toggleCommentLike fails', (done) => {
      ;(commentsService.toggleCommentLike as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(CommentsActions.toggleCommentLike({ commentId: '2' }))

      effects.toggleCommentLike$.subscribe((action) => {
        expect(action).toEqual(
          CommentsActions.toggleCommentLikeFailure({ error: 'test error' })
        )

        done()
      })
    })
  })
})
