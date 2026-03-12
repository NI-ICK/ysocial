import { ComponentFixture, TestBed } from '@angular/core/testing'
import { PostDetailsComponent } from './post-details.component'
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import {
  clearCurrentPost,
  deletePost,
  editPost,
  loadCurrentPost,
} from '../../../store/posts/posts.actions'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { forkJoin, take } from 'rxjs'
import { User } from '../../../utils/user.interface'
import { selectCurrentPost } from '../../../store/posts/posts.selectors'
import { Post } from '../../../utils/post.interface'

describe('PostDetailsComponent', () => {
  let component: PostDetailsComponent
  let fixture: ComponentFixture<PostDetailsComponent>
  let routerMock: Partial<Router>
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

  beforeEach(async () => {
    routerMock = {
      navigate: jest.fn(),
    }
    activatedRouteMock = {
      snapshot: {
        paramMap: convertToParamMap({ postId: '123' }),
      },
    }

    await TestBed.configureTestingModule({
      imports: [PostDetailsComponent],
      providers: [
        provideMockStore(),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(PostDetailsComponent)
    component = fixture.componentInstance
    store = TestBed.inject(MockStore)
    fixture.detectChanges()

    store.overrideSelector(selectCurrentUser, userMock)
    store.overrideSelector(selectCurrentPost, postMock)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should navigate to 404 page if postId is null', () => {
      activatedRouteMock.snapshot.paramMap = convertToParamMap({ postId: null })

      component.ngOnInit()

      expect(routerMock.navigate).toHaveBeenCalledWith(['/404'])
    })

    it('should assign post, currentUser, default form value and dispatch loadCurrentPost', (done) => {
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.ngOnInit()

      expect(dispatchSpy).toHaveBeenCalledWith(loadCurrentPost({ id: '123' }))
      forkJoin({
        user: component.currentUser$.pipe(take(1)),
        post: component.post$.pipe(take(1)),
      }).subscribe(({ user, post }) => {
        if (!post || !user) return

        expect(user.id).toEqual('234')
        expect(user.username).toEqual('test')

        expect(post.id).toEqual('123')
        expect(post.body).toEqual('test')

        done()
      })
      expect(component.editForm.get('body')?.value).toEqual('test')
    })
  })

  describe('deletePost', () => {
    it('should dispatch deletePost and navigate', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.deletePost()

      expect(dispatchSpy).toHaveBeenCalledWith(deletePost({ post: postMock }))
      expect(routerMock.navigate).toHaveBeenCalledWith(['/'])
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
})
