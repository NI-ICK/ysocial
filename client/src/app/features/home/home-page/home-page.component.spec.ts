import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HomePageComponent } from './home-page.component'
import { Component, Input } from '@angular/core'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { MemoizedSelector } from '@ngrx/store'
import { Post } from '../../../utils/interfaces/post.interface'
import {
  selectAllPosts,
  selectPostsLoading,
} from '../../../store/posts/posts.selectors'
import { loadPosts } from '../../../store/posts/posts.actions'
import { CommonModule } from '@angular/common'
import { take } from 'rxjs'

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
            CommonModule,
          ],
        },
      })
      .compileComponents()

    store = TestBed.inject(MockStore)
    mockSelectAllPosts = store.overrideSelector(selectAllPosts, mockPosts)
    mockSelectPostsLoading = store.overrideSelector(selectPostsLoading, false)

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

  it('should dispatch loadPosts on init', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch')

    component.ngOnInit()

    expect(dispatchSpy).toHaveBeenCalledWith(loadPosts())
  })

  it('should select posts from the store', (done) => {
    component.posts$.pipe(take(1)).subscribe((posts) => {
      expect(posts).toEqual(mockPosts)
      done()
    })
  })
})
