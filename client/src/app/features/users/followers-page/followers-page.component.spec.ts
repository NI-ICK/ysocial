import { Component, Input } from '@angular/core'
import { User } from '../../../utils/interfaces/user.interface'
import { FollowersPageComponent } from './followers-page.component'
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
import {
  selectFollowers,
  selectFollowersLoading,
  selectNoMoreFollowers,
} from '../../../store/users/users.selectors'
import { take } from 'rxjs'
import {
  clearFollowers,
  loadFollowers,
} from '../../../store/users/users.actions'
import { By } from '@angular/platform-browser'
import { LoadingComponent } from '../../../shared/loading/loading.component'

@Component({ selector: 'user-card' })
class UserCardComponentMock {
  @Input() user!: User
}

describe('FollowersPageComponent', () => {
  let component: FollowersPageComponent
  let fixture: ComponentFixture<FollowersPageComponent>
  let mockStore: MockStore
  let router: Router
  let activatedRouteMock = {
    snapshot: {
      paramMap: convertToParamMap({ username: 'test' }),
    },
  }

  const mockFollowers = [
    { id: '1', username: 'test' } as User,
    { id: '2', username: 'test2' } as User,
  ]

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowersPageComponent, RouterModule.forRoot([])],
      providers: [
        provideMockStore(),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    })
      .overrideComponent(FollowersPageComponent, {
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

    fixture = TestBed.createComponent(FollowersPageComponent)
    mockStore = TestBed.inject(MockStore)
    component = fixture.componentInstance
    router = TestBed.inject(Router)

    mockStore.overrideSelector(selectFollowers, mockFollowers)
    mockStore.overrideSelector(selectNoMoreFollowers, false)
    mockStore.overrideSelector(selectFollowersLoading, false)

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should select followers', (done) => {
      component.followers$.pipe(take(1)).subscribe((followers) => {
        expect(followers).toEqual(mockFollowers)
        done()
      })
    })
  })

  it('should increment offset when loading followers', () => {
    const dispatchSpy = jest.spyOn(mockStore, 'dispatch')

    component.loadFollowers(0)

    expect(component.loadOffset).toBe(5)
    expect(dispatchSpy).toHaveBeenCalledWith(
      loadFollowers({ offset: 0, username: 'test' })
    )
  })

  it('should load more followers on scroll', () => {
    const spy = jest.spyOn(component, 'loadFollowers')
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

    const spy = jest.spyOn(component, 'loadFollowers')

    component.fillFollowersToScreen()

    setTimeout(() => {
      expect(spy).toHaveBeenCalled()
      done()
    }, 150)
  })

  describe('ngOnDestroy', () => {
    it('should dispatch clearFollowers', () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch')

      component.ngOnDestroy()

      expect(dispatchSpy).toHaveBeenCalledWith(clearFollowers())
    })
  })

  describe('template', () => {
    it('should show loading component if followers are loading', () => {
      mockStore.overrideSelector(selectFollowersLoading, true)
      mockStore.refreshState()

      fixture.detectChanges()

      const loading = fixture.debugElement.query(By.css('loading'))
      expect(loading).toBeTruthy()
    })

    it('should render followers', () => {
      const followers = fixture.debugElement.queryAll(By.css('user-card'))

      expect(followers.length).toEqual(mockFollowers.length)
    })

    it('should render message if there are no more posts', () => {
      mockStore.overrideSelector(selectFollowers, [])
      mockStore.overrideSelector(selectNoMoreFollowers, true)
      mockStore.refreshState()

      fixture.detectChanges()

      const message = fixture.nativeElement.textContent
      expect(message).toContain('Nothing to see here...')
    })
  })
})
