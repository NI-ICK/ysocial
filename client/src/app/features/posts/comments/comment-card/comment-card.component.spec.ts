import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CommentCardComponent } from './comment-card.component'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { UiStateService } from '../../../../shared/services/ui-state-service/ui-state.service'
import {
  selectCommentsState,
  selectIsLiking,
} from '../../../../store/comments/comments.selectors'
import { User } from '../../../../utils/interfaces/user.interface'
import { selectCurrentUser } from '../../../../store/auth/auth.selectors'
import { Comment } from '../../../../utils/interfaces/comment.interface'
import { forkJoin, take } from 'rxjs'
import { RouterModule } from '@angular/router'
import { CommentsState } from '../../../../store/comments/comments.state'
import {
  createComment,
  toggleCommentLike,
} from '../../../../store/comments/comments.actions'

describe('CommentCardComponent', () => {
  let component: CommentCardComponent
  let fixture: ComponentFixture<CommentCardComponent>
  let uiStateService: Partial<UiStateService>
  let store: MockStore

  const mockUser = { id: '1', username: 'test' } as User
  const mockReply1 = { id: '1', body: 'test', parent: { id: '1' } } as Comment
  const mockReply2 = { id: '2', body: 'test2', parent: { id: '1' } } as Comment

  const mockCommentsState: CommentsState = {
    replies: {
      '1': ['1', '2'],
    },
    ids: ['1', '2'],
    entities: {
      '1': mockReply1,
      '2': mockReply2,
    },
    postComments: {},
    loadingRootComments: {},
    loadingReplies: {},
    likingComment: {},
    error: null,
  }

  beforeEach(async () => {
    uiStateService = {
      expandReplies: jest.fn(),
      collapseReplies: jest.fn(),
      areRepliesExpanded: jest.fn(),
    }

    await TestBed.configureTestingModule({
      imports: [CommentCardComponent, RouterModule.forRoot([])],
      providers: [
        provideMockStore(),
        { provide: UiStateService, useValue: uiStateService },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(CommentCardComponent)
    store = TestBed.inject(MockStore)
    component = fixture.componentInstance

    component.postId = '2'
    component.comment = {
      id: '1',
      user: {
        username: 'test',
      },
    } as Comment

    store.overrideSelector(selectIsLiking, { '1': false })
    store.overrideSelector(selectCurrentUser, mockUser)
    store.overrideSelector(selectCommentsState, mockCommentsState)
    store.refreshState()

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should assign isLiking, currentUser and replies', (done) => {
      component.ngOnInit()

      forkJoin({
        isLiking: component.isLiking$.pipe(take(1)),
        currentUser: component.currentUser$.pipe(take(1)),
        replies: component.replies$.pipe(take(1)),
      }).subscribe(({ isLiking, currentUser, replies }) => {
        expect(isLiking).toEqual(false)
        expect(currentUser).toEqual(mockUser)
        expect(replies).toEqual([mockReply1, mockReply2])

        done()
      })
    })
  })

  describe('expandReplies', () => {
    it('should call uiStateService.expandReplies', () => {
      component.expandReplies()

      expect(uiStateService.expandReplies).toHaveBeenCalled()
    })
  })

  describe('collapseReplies', () => {
    it('should call uiStateService.collapseReplies', () => {
      component.collapseReplies()

      expect(uiStateService.collapseReplies).toHaveBeenCalled()
    })
  })

  describe('areRepliesExpanded', () => {
    it('should call uiStateService.areRepliesExpanded', () => {
      component.areRepliesExpanded()

      expect(uiStateService.areRepliesExpanded).toHaveBeenCalled()
    })
  })

  describe('handleFormSubmit', () => {
    it('should return if body is null', () => {
      component.createReplyForm.setValue({ body: '' })
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.handleFormSubmit()

      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it('should call dispatch, reset form and expand reples if body is provided', () => {
      component.createReplyForm.setValue({ body: 'test' })
      const dispatchSpy = jest.spyOn(store, 'dispatch')
      const resetFormSpy = jest.spyOn(component.createReplyForm, 'reset')
      const expandRepliesSpy = jest.spyOn(component, 'expandReplies')

      component.handleFormSubmit()

      expect(expandRepliesSpy).toHaveBeenCalled()
      expect(resetFormSpy).toHaveBeenCalled()
      expect(dispatchSpy).toHaveBeenCalledWith(
        createComment({ body: 'test', postId: '2', parentId: '1' })
      )
    })
  })

  describe('toggleLike', () => {
    it('should return if currentUser is null', () => {
      store.overrideSelector(selectCurrentUser, null)
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.toggleLike()

      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it('should return if isLiking is true', () => {
      store.overrideSelector(selectIsLiking, { '1': true })
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.toggleLike()

      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it('should call dispatch', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.toggleLike()

      expect(dispatchSpy).toHaveBeenCalledWith(
        toggleCommentLike({ commentId: '1' })
      )
    })
  })
})
