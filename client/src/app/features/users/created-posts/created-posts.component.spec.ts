import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CreatedPostsComponent } from './created-posts.component'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { selectCreatedPosts } from '../../../store/posts/posts.selectors'
import {
  selectCreatedPostsLoading,
  selectNoMoreCreatedPosts,
} from '../../../store/users/users.selectors'
import { Post } from '../../../utils/interfaces/post.interface'
import { take } from 'rxjs'
import {
  ActivatedRoute,
  convertToParamMap,
  Router,
  RouterModule,
} from '@angular/router'
import { Component, Input } from '@angular/core'
import { InfiniteScrollDirective } from 'ngx-infinite-scroll'
import { CommonModule } from '@angular/common'
import {
  clearCreatedPosts,
  loadCreatedPosts,
} from '../../../store/users/users.actions'
import { By } from '@angular/platform-browser'
import { LoadingComponent } from '../../../shared/loading/loading.component'

@Component({ selector: 'post-card' })
class PostCardComponentMock {
  @Input() post!: Post
}

describe('CreatedPostsComponent', () => {
  let component: CreatedPostsComponent
  let fixture: ComponentFixture<CreatedPostsComponent>
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
      imports: [CreatedPostsComponent, RouterModule.forRoot([])],
      providers: [
        provideMockStore(),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    })
      .overrideComponent(CreatedPostsComponent, {
        set: {
          imports: [
            PostCardComponentMock,
            InfiniteScrollDirective,
            CommonModule,
            LoadingComponent,
          ],
        },
      })
      .compileComponents()

    fixture = TestBed.createComponent(CreatedPostsComponent)
    mockStore = TestBed.inject(MockStore)
    component = fixture.componentInstance
    router = TestBed.inject(Router)
    component.userId = '123'

    mockStore.overrideSelector(selectCreatedPosts, mockPosts)
    mockStore.overrideSelector(selectNoMoreCreatedPosts, false)
    mockStore.overrideSelector(selectCreatedPostsLoading, false)

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should select createdPosts', (done) => {
      component.createdPosts$.pipe(take(1)).subscribe((posts) => {
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
      loadCreatedPosts({ offset: 0, userId: '123' })
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
    it('should dispatch clearCreatedPosts', () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch')

      component.ngOnDestroy()

      expect(dispatchSpy).toHaveBeenCalledWith(clearCreatedPosts())
    })
  })

  describe('template', () => {
    it('should show loading component if posts are loading', () => {
      mockStore.overrideSelector(selectCreatedPostsLoading, true)
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
      mockStore.overrideSelector(selectCreatedPosts, [])
      mockStore.overrideSelector(selectNoMoreCreatedPosts, true)
      mockStore.refreshState()

      fixture.detectChanges()

      const message = fixture.nativeElement.textContent
      expect(message).toContain('Nothing to see here...')
    })
  })
})
