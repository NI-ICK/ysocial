import { ComponentFixture, TestBed } from '@angular/core/testing'
import { PostCardComponent } from './post-card.component'
import { UiStateService } from '../../../shared/services/ui-state-service/ui-state.service'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { selectIsLiking } from '../../../store/posts/posts.selectors'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { User } from '../../../utils/interfaces/user.interface'
import { Post } from '../../../utils/interfaces/post.interface'
import { RouterModule } from '@angular/router'
import { togglePostLike } from '../../../store/posts/posts.actions'
import { forkJoin, take } from 'rxjs'

describe('PostCardComponent', () => {
  let component: PostCardComponent
  let fixture: ComponentFixture<PostCardComponent>
  let uiStateService: Partial<UiStateService>
  let store: MockStore

  const mockUser = {
    id: '1',
    username: 'test',
  } as User

  beforeEach(async () => {
    uiStateService = {
      isPostExpanded: jest.fn(),
      setExpandedPost: jest.fn(),
    }

    await TestBed.configureTestingModule({
      imports: [PostCardComponent, RouterModule.forRoot([])],
      providers: [
        provideMockStore(),
        { provide: UiStateService, useValue: uiStateService },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(PostCardComponent)
    store = TestBed.inject(MockStore)
    component = fixture.componentInstance

    component.post = {
      id: '1',
      body: 'test',
      user: {},
    } as Post

    store.overrideSelector(selectIsLiking, { '1': false })
    store.overrideSelector(selectCurrentUser, mockUser)

    store.refreshState()
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should assign isLiking and currentUser', (done) => {
      component.ngOnInit()

      forkJoin({
        isLiking: component.isLiking$.pipe(take(1)),
        currentUser: component.currentUser$.pipe(take(1)),
      }).subscribe(({ isLiking, currentUser }) => {
        expect(isLiking).toEqual(false)
        expect(currentUser).toEqual(mockUser)
        done()
      })
    })
  })

  describe('handleExpand', () => {
    it('should call service', () => {
      component.handleExpand()

      expect(uiStateService.setExpandedPost).toHaveBeenCalled()
    })
  })

  describe('isExpanded', () => {
    it('should call service', () => {
      component.isExpanded()

      expect(uiStateService.isPostExpanded).toHaveBeenCalled()
    })
  })

  describe('toggleLike', () => {
    it('should return if currentUser is null', () => {
      store.overrideSelector(selectCurrentUser, null)
      store.refreshState()
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.toggleLike()

      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it('should return if isLiking is true', () => {
      store.overrideSelector(selectIsLiking, { '1': true })
      store.refreshState()
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.toggleLike()

      expect(dispatchSpy).not.toHaveBeenCalled()
    })

    it('should dispatch togglePostLike', () => {
      const dispatchSpy = jest.spyOn(store, 'dispatch')

      component.toggleLike()

      expect(dispatchSpy).toHaveBeenCalledWith(togglePostLike({ postId: '1' }))
    })
  })
})
