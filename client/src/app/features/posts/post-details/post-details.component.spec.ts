import { ComponentFixture, TestBed } from '@angular/core/testing'
import { PostDetailsComponent } from './post-details.component'
import {
  ActivatedRoute,
  convertToParamMap,
  Router,
  RouterModule,
} from '@angular/router'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import {
  clearCurrentPost,
  deletePost,
  editPost,
  loadCurrentPost,
  togglePostLike,
} from '../../../store/posts/posts.actions'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { forkJoin, take } from 'rxjs'
import { User } from '../../../utils/interfaces/user.interface'
import {
  selectCurrentPost,
  selectIsLiking,
} from '../../../store/posts/posts.selectors'
import { Post } from '../../../utils/interfaces/post.interface'
import { CommentsState } from '../../../store/comments/comments.state'
import {
  selectCommentsState,
  selectLoadingComments,
} from '../../../store/comments/comments.selectors'
import { Comment } from '../../../utils/interfaces/comment.interface'

describe('PostDetailsComponent', () => {
  let component: PostDetailsComponent
  let fixture: ComponentFixture<PostDetailsComponent>
  let router: Router
  let activatedRouteMock = {
    snapshot: {
      paramMap: convertToParamMap({ postId: '123' }),
    },
  }
  let store: MockStore

  const postMock = {
    id: '123',
    body: 'test',
    user: {
      username: 'test',
    },
  } as Post
  const userMock = {
    id: '234',
    username: 'test',
  } as User
  const mockComment1 = {
    id: '1',
    body: 'test',
    user: {
      username: 'test',
    },
  } as Comment
  const mockComment2 = {
    id: '2',
    body: 'test2',
    user: {
      username: 'test',
    },
  } as Comment
  const mockCommentsState: CommentsState = {
    replies: {},
    ids: ['1', '2'],
    entities: {
      '1': mockComment1,
      '2': mockComment2,
    },
    postComments: { '123': ['1', '2'] },
    loadingRootComments: false,
    loadingReplies: false,
    likingComment: {},
    error: null,
  }

  beforeEach(async () => {
    activatedRouteMock = {
      snapshot: {
        paramMap: convertToParamMap({ postId: '123' }),
      },
    }

    await TestBed.configureTestingModule({
      imports: [PostDetailsComponent, RouterModule.forRoot([])],
      providers: [
        provideMockStore(),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(PostDetailsComponent)
    component = fixture.componentInstance
    store = TestBed.inject(MockStore)
    router = TestBed.inject(Router)

    store.overrideSelector(selectCurrentUser, userMock)
    store.overrideSelector(selectCurrentPost, postMock)
    store.overrideSelector(selectIsLiking, { '123': false })
    store.overrideSelector(selectCommentsState, mockCommentsState)
    store.overrideSelector(selectLoadingComments, false)

    fixture.detectChanges()
  })

  afterEach(() => {
    store.resetSelectors()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should navigate to 404 page if postId is null', () => {
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ postId: null })
      const navigateSpy = jest.spyOn(router, 'navigate')

      component.ngOnInit()

      expect(navigateSpy).toHaveBeenCalledWith(['/404'])
    })

    it('should assign default form value and dispatch loadCurrentPost', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.ngOnInit()

      expect(dispatchSpy).toHaveBeenCalledWith(loadCurrentPost({ id: '123' }))
      expect(component.editForm.get('body')?.value).toEqual('test')
    })

    it('should select currentUser', (done) => {
      component.ngOnInit()

      component.currentUser$.pipe(take(1)).subscribe((user) => {
        expect(user?.id).toEqual('234')
        expect(user?.username).toEqual('test')
        done()
      })
    })

    it('should select currentPost', (done) => {
      component.ngOnInit()

      component.post$.pipe(take(1)).subscribe((post) => {
        expect(post?.id).toEqual('123')
        expect(post?.body).toEqual('test')
        done()
      })
    })

    it('should select comments', (done) => {
      component.ngOnInit()

      component.comments$.pipe(take(1)).subscribe((comments) => {
        expect(comments[0].body).toEqual('test')
        expect(comments[1].body).toEqual('test2')
        done()
      })
    })

    it('should select isLiking', (done) => {
      component.ngOnInit()

      component.isLiking$.pipe(take(1)).subscribe((isLiking) => {
        expect(isLiking).toEqual(false)
        done()
      })
    })

    it('should select loadingComments', (done) => {
      component.ngOnInit()

      component.loadingComments$.pipe(take(1)).subscribe((loading) => {
        expect(loading).toEqual(false)
        done()
      })
    })
  })

  describe('deletePost', () => {
    it('should dispatch deletePost and navigate', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch')
      const navigateSpy = jest.spyOn(router, 'navigate')

      component.deletePost()

      expect(dispatchSpy).toHaveBeenCalledWith(deletePost({ post: postMock }))
      expect(navigateSpy).toHaveBeenCalledWith(['/'])
    })
  })

  describe('editPost', () => {
    it('should show delete confirmation if post has no image and edit form value is null', () => {
      component.editForm.setValue({ body: '' })
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.editPost()

      expect(component.confirmationVisible).toEqual(true)
      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it('should dispatch and close modals', () => {
      component.editForm.setValue({ body: 'test2' })

      const dispatchSpy = jest.spyOn(store, 'dispatch')
      const closeEditSpy = jest.spyOn(component, 'closeEdit')
      const closeOptionsSpy = jest.spyOn(component, 'closeOptions')

      component.editPost()

      expect(dispatchSpy).toHaveBeenCalledWith(
        editPost({ id: '123', body: 'test2', prevBody: 'test' })
      )
      expect(closeEditSpy).toHaveBeenCalled()
      expect(closeOptionsSpy).toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should dispatch clearCurrentPost', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.ngOnDestroy()

      expect(dispatchSpy).toHaveBeenCalledWith(clearCurrentPost())
    })
  })

  describe('toggleLike', () => {
    it('should return if post is null', () => {
      store.overrideSelector(selectCurrentPost, null)
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.toggleLike()

      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it('should return if isLiking is true', () => {
      store.overrideSelector(selectIsLiking, { '123': true })
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.toggleLike()

      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it('should return if currentUser is null', () => {
      store.overrideSelector(selectCurrentUser, null)
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.toggleLike()

      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it('should dispatch togglePostLike', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.toggleLike()

      expect(dispatchSpy).toHaveBeenCalledWith(
        togglePostLike({ postId: '123' })
      )
    })
  })
})
