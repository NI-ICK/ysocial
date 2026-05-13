import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HomePageComponent } from './home-page.component'
import { Component, Input } from '@angular/core'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { MemoizedSelector } from '@ngrx/store'
import { Post } from '../../../utils/interfaces/post.interface'
import {
  selectAllPosts,
  selectNoMorePosts,
  selectPostsLoading,
} from '../../../store/posts/posts.selectors'
import { CommonModule } from '@angular/common'
import { take } from 'rxjs'
import { InfiniteScrollDirective } from 'ngx-infinite-scroll'
import { loadPosts } from '../../../store/posts/posts.actions'
import { By } from '@angular/platform-browser'
import { LoadingComponent } from '../../../shared/loading/loading.component'

@Component({ selector: 'post-card' })
class PostCardComponentMock {
  @Input() post!: Post
}

@Component({ selector: 'create-post-form' })
class CreatePostFormComponentMock {}

describe('HomePageComponent', () => {
  let component: HomePageComponent
  let fixture: ComponentFixture<HomePageComponent>
  let store: MockStore
  let mockSelectAllPosts: MemoizedSelector<any, Post[]>
  let mockSelectPostsLoading: MemoizedSelector<any, boolean>
  let mockSelectNoMorePosts: MemoizedSelector<any, boolean>

  const mockPosts: Post[] = [
    { id: '1', body: 'test', createdAt: new Date().toISOString() } as Post,
  ]

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideMockStore()],
    })
      .overrideComponent(HomePageComponent, {
        set: {
          imports: [
            PostCardComponentMock,
            CreatePostFormComponentMock,
            InfiniteScrollDirective,
            CommonModule,
            LoadingComponent,
          ],
        },
      })
      .compileComponents()

    store = TestBed.inject(MockStore)
    mockSelectAllPosts = store.overrideSelector(selectAllPosts, mockPosts)
    mockSelectPostsLoading = store.overrideSelector(selectPostsLoading, false)
    mockSelectNoMorePosts = store.overrideSelector(selectNoMorePosts, false)

    fixture = TestBed.createComponent(HomePageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should NOT dispatch loadPosts if already loading', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch')
    store.overrideSelector(selectPostsLoading, true)

    component.ngOnInit()

    expect(dispatchSpy).not.toHaveBeenCalled()
  })

  it('should dispatch loadPosts on init when not loading', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch')

    component.ngOnInit()

    expect(dispatchSpy).toHaveBeenCalledWith(loadPosts({ offset: 0 }))
  })

  it('should select posts from store', (done) => {
    component.posts$.pipe(take(1)).subscribe((posts) => {
      expect(posts).toEqual(mockPosts)
      done()
    })
  })

  it('should increment offset when loading posts', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch')

    component.loadPosts(0)

    expect(component.loadOffset).toBe(10)
    expect(dispatchSpy).toHaveBeenCalledWith(loadPosts({ offset: 0 }))
  })

  it('should load more posts on scroll', () => {
    const spy = jest.spyOn(component, 'loadPosts')
    component.onScroll()
    expect(spy).toHaveBeenCalled()
  })

  it('should select posts from the store', (done) => {
    component.posts$.pipe(take(1)).subscribe((posts) => {
      expect(posts).toEqual(mockPosts)
      done()
    })
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

  describe('template', () => {
    it('should render posts', () => {
      component.ngOnInit()

      const posts = fixture.debugElement.queryAll(By.css('post-card'))
      expect(posts.length).toBe(mockPosts.length)
    })

    it('should render loading component if posts are loading', () => {
      store.overrideSelector(selectPostsLoading, true)
      store.refreshState()

      fixture.detectChanges()

      const loading = fixture.debugElement.query(By.css('loading'))
      expect(loading).toBeTruthy()
    })

    it('should show message if there are no more posts', () => {
      store.overrideSelector(selectAllPosts, [])
      store.overrideSelector(selectNoMorePosts, true)
      store.refreshState()

      fixture.detectChanges()

      const message = fixture.nativeElement.textContent
      expect(message).toContain('Nothing to see here...')
    })
  })
})
