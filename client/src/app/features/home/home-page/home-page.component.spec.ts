import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HomePageComponent } from './home-page.component'
import { Component } from '@angular/core'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { MemoizedSelector } from '@ngrx/store'
import { Post } from '../../../utils/post.interface'
import { selectAllPosts } from '../../../store/posts/posts.selectors'
import { loadPosts } from '../../../store/posts/posts.actions'
import { CommonModule } from '@angular/common'

@Component({ selector: 'post-feed' })
class PostFeedComponentMock {}

@Component({ selector: 'create-post-form' })
class CreatePostFormComponentMock {}

describe('HomePageComponent', () => {
  let component: HomePageComponent
  let fixture: ComponentFixture<HomePageComponent>
  let store: MockStore
  let mockSelectAllPosts: MemoizedSelector<any, Post[]>

  const mockPosts: Post[] = [
    { id: '1', body: 'test', createdAt: new Date() } as Post,
  ]

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [provideMockStore()],
    })
      .overrideComponent(HomePageComponent, {
        set: {
          imports: [
            PostFeedComponentMock,
            CreatePostFormComponentMock,
            CommonModule,
          ],
        },
      })
      .compileComponents()

    store = TestBed.inject(MockStore)
    mockSelectAllPosts = store.overrideSelector(selectAllPosts, mockPosts)

    fixture = TestBed.createComponent(HomePageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should dispatch loadPosts on init ', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch')

    component.ngOnInit()

    expect(dispatchSpy).toHaveBeenCalledWith(loadPosts())
  })

  it('should select posts from the store', () => {
    component.posts$.subscribe((posts) => {
      expect(posts).toEqual(mockPosts)
    })
  })
})
