import { ComponentFixture, TestBed } from '@angular/core/testing'

import { UserCardComponent } from './user-card.component'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { User } from '../../../utils/interfaces/user.interface'
import { take } from 'rxjs'
import { RouterModule } from '@angular/router'
import { toggleFollow } from '../../../store/users/users.actions'
import { By } from '@angular/platform-browser'

describe('UserCardComponent', () => {
  let component: UserCardComponent
  let fixture: ComponentFixture<UserCardComponent>
  let mockStore: MockStore

  const mockUser1 = { id: '1', username: 'test' } as User
  const mockUser2 = { id: '2', username: 'test2', bio: 'test bio' } as User

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCardComponent, RouterModule.forRoot([])],
      providers: [provideMockStore()],
    }).compileComponents()

    fixture = TestBed.createComponent(UserCardComponent)
    component = fixture.componentInstance

    component.user = { ...mockUser2 }

    mockStore = TestBed.inject(MockStore)
    mockStore.overrideSelector(selectCurrentUser, mockUser1)

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should select currentUser', (done) => {
      component.currentUser$.pipe(take(1)).subscribe((currentUser) => {
        expect(currentUser).toEqual(mockUser1)
        done()
      })
    })
  })

  describe('handleFollow', () => {
    it('should dispatch toggleFollow', () => {
      const dispatchSpy = jest.spyOn(mockStore, 'dispatch')
      component.handleFollow()

      expect(dispatchSpy).toHaveBeenCalledWith(toggleFollow({ userId: '2' }))
    })
  })

  describe('template', () => {
    it('should not render bio if user does not have it', () => {
      component.user.bio = null

      fixture.detectChanges()

      const bio = document.querySelector('.bio')

      expect(bio).not.toBeTruthy()
    })

    it('should render bio if user has one', () => {
      const bio = document.querySelector('.bio')

      expect(bio).toBeTruthy()
    })

    it('should hide follow button for the same user', () => {
      component.user = mockUser1

      fixture.detectChanges()

      const button = fixture.nativeElement.querySelector('button')

      expect(button).not.toBeTruthy()
    })

    it('should show follow button for a different user', () => {
      const button = fixture.nativeElement.querySelector('button')

      expect(button).toBeTruthy()
    })

    it('should call handleFollow on click', () => {
      const spy = jest.spyOn(component, 'handleFollow')
      const button = fixture.nativeElement.querySelector('button')

      button.click()

      expect(spy).toHaveBeenCalled()
    })
  })
})
