import { Component, Input } from '@angular/core'
import { Post } from '../../../utils/interfaces/post.interface'
import { LikedPostsComponent } from './liked-posts.component'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import {
  ActivatedRoute,
  convertToParamMap,
  Router,
  RouterModule,
} from '@angular/router'
import { InfiniteScrollDirective } from 'ngx-infinite-scroll'
import { CommonModule } from '@angular/common'
import { selectLikedPosts } from '../../../store/posts/posts.selectors'
import {
  selectLikedPostsLoading,
  selectNoMoreLikedPosts,
} from '../../../store/users/users.selectors'
import { take } from 'rxjs'
import {
  clearLikedPosts,
  loadLikedPosts,
} from '../../../store/users/users.actions'
import { By } from '@angular/platform-browser'
import { LoadingComponent } from '../../../shared/loading/loading.component'

@Component({ selector: 'post-card' })
class PostCardComponentMock {
  @Input() post!: Post
}

describe('LikedPostsComponent', () => {
  let component: LikedPostsComponent
  let fixture: ComponentFixture<LikedPostsComponent>
  let mockStore: MockStore
  let router: Router
  let activatedRouteMock = {
    snapshot: {
      paramMap: convertToParamMap({ username: 'test' }),
    },
  }

  const mockPosts = [
    { id: '1', body: 'test' } as Post,
    { id: '2', body: 'test2' } as Post,
  ]

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikedPostsComponent, RouterModule.forRoot([])],
      providers: [
        provideMockStore(),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    })
      .overrideComponent(LikedPostsComponent, {
        set: {
          imports: [
            PostCardComponentMock,
            InfiniteScrollDirective,
            LoadingComponent,
            CommonModule,
          ],
        },
      })
      .compileComponents()

    fixture = TestBed.createComponent(LikedPostsComponent)
    mockStore = TestBed.inject(MockStore)
    component = fixture.componentInstance
    router = TestBed.inject(Router)
    component.userId = '123'

    mockStore.overrideSelector(selectLikedPosts, mockPosts)
    mockStore.overrideSelector(selectNoMoreLikedPosts, false)
    mockStore.overrideSelector(selectLikedPostsLoading, false)

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should select likedPosts', (done) => {
      component.likedPosts$.pipe(take(1)).subscribe((posts) => {
        expect(posts).toEqual(mockPosts)
        done()
      })
    })
  })

  it('should increment offset when loading posts', () => {
    const dispatchSpy = jest.spyOn(mockStore, 'dispatch')

    component.loadPosts(0)

    expect(component.loadOffset).toBe(10)
    expect(dispatchSpy).toHaveBeenCalledWith(
      loadLikedPosts({ offset: 0, userId: '123' })
    )
  })

  it('should load more posts on scroll', () => {
    const spy = jest.spyOn(component, 'loadPosts')
    component.onScroll()
    expect(spy).toHaveBeenCalled()
  })

  it('should attempt to load more if screen is not scrollable', (done) => {
    component.isBrowser = true

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    })

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 500,
    })

    const spy = jest.spyOn(component, 'loadPosts')

    component.fillPostsToScreen()

    setTimeout(() => {
      expect(spy).toHaveBeenCalled()
      done()
    }, 150)
  })

  describe('ngOnDestroy', () => {
    it('should dispatch clearLikedPosts', () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch')

      component.ngOnDestroy()

      expect(dispatchSpy).toHaveBeenCalledWith(clearLikedPosts())
    })
  })

  describe('template', () => {
    it('should show loading component if posts are loading', () => {
      mockStore.overrideSelector(selectLikedPostsLoading, true)
      mockStore.refreshState()

      fixture.detectChanges()

      const loading = fixture.debugElement.query(By.css('loading'))
      expect(loading).toBeTruthy()
    })

    it('should render created posts', () => {
      const posts = fixture.debugElement.queryAll(By.css('post-card'))

      expect(posts.length).toEqual(mockPosts.length)
    })

    it('should render message if there are no more posts', () => {
      mockStore.overrideSelector(selectLikedPosts, [])
      mockStore.overrideSelector(selectNoMoreLikedPosts, true)
      mockStore.refreshState()

      fixture.detectChanges()

      const message = fixture.nativeElement.textContent
      expect(message).toContain('Nothing to see here...')
    })
  })
})
