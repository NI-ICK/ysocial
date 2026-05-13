import { Component, Input } from '@angular/core'
import { User } from '../../../utils/interfaces/user.interface'
import { FollowingPageComponent } from './following-page.component'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import {
  ActivatedRoute,
  convertToParamMap,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router'
import { InfiniteScrollDirective } from 'ngx-infinite-scroll'
import { CommonModule } from '@angular/common'
import { LoadingComponent } from '../../../shared/loading/loading.component'
import {
  selectFollowing,
  selectFollowingLoading,
  selectNoMoreFollowing,
} from '../../../store/users/users.selectors'
import { take } from 'rxjs'
import {
  clearFollowing,
  loadFollowing,
} from '../../../store/users/users.actions'
import { By } from '@angular/platform-browser'

@Component({ selector: 'user-card' })
class UserCardComponentMock {
  @Input() user!: User
}

describe('FollowingPageComponent', () => {
  let component: FollowingPageComponent
  let fixture: ComponentFixture<FollowingPageComponent>
  let mockStore: MockStore
  let router: Router
  let activatedRouteMock = {
    snapshot: {
      paramMap: convertToParamMap({ username: 'test' }),
    },
  }

  const mockFollowing = [
    { id: '1', username: 'test' } as User,
    { id: '2', username: 'test2' } as User,
  ]

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowingPageComponent, RouterModule.forRoot([])],
      providers: [
        provideMockStore(),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    })
      .overrideComponent(FollowingPageComponent, {
        set: {
          imports: [
            UserCardComponentMock,
            InfiniteScrollDirective,
            CommonModule,
            RouterLink,
            LoadingComponent,
          ],
        },
      })
      .compileComponents()

    fixture = TestBed.createComponent(FollowingPageComponent)
    mockStore = TestBed.inject(MockStore)
    component = fixture.componentInstance
    router = TestBed.inject(Router)

    mockStore.overrideSelector(selectFollowing, mockFollowing)
    mockStore.overrideSelector(selectNoMoreFollowing, false)
    mockStore.overrideSelector(selectFollowingLoading, false)

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should select following', (done) => {
      component.following$.pipe(take(1)).subscribe((following) => {
        expect(following).toEqual(mockFollowing)
        done()
      })
    })
  })

  it('should increment offset when loading following', () => {
    const dispatchSpy = jest.spyOn(mockStore, 'dispatch')

    component.loadFollowing(0)

    expect(component.loadOffset).toBe(5)
    expect(dispatchSpy).toHaveBeenCalledWith(
      loadFollowing({ offset: 0, username: 'test' })
    )
  })

  it('should load more following on scroll', () => {
    const spy = jest.spyOn(component, 'loadFollowing')
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

    const spy = jest.spyOn(component, 'loadFollowing')

    component.fillFollowingToScreen()

    setTimeout(() => {
      expect(spy).toHaveBeenCalled()
      done()
    }, 150)
  })

  describe('ngOnDestroy', () => {
    it('should dispatch clearFollowing', () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch')

      component.ngOnDestroy()

      expect(dispatchSpy).toHaveBeenCalledWith(clearFollowing())
    })
  })

  describe('template', () => {
    it('should show loading component if following are loading', () => {
      mockStore.overrideSelector(selectFollowingLoading, true)
      mockStore.refreshState()

      fixture.detectChanges()

      const loading = fixture.debugElement.query(By.css('loading'))
      expect(loading).toBeTruthy()
    })

    it('should render following', () => {
      const following = fixture.debugElement.queryAll(By.css('user-card'))

      expect(following.length).toEqual(mockFollowing.length)
    })

    it('should render message if there are no more posts', () => {
      mockStore.overrideSelector(selectFollowing, [])
      mockStore.overrideSelector(selectNoMoreFollowing, true)
      mockStore.refreshState()

      fixture.detectChanges()

      const message = fixture.nativeElement.textContent
      expect(message).toContain('Nothing to see here...')
    })
  })
})
