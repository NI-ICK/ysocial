import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UserMenuComponent } from './user-menu.component'
import { By } from '@angular/platform-browser'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { logoutUser } from '../../../store/auth/auth.actions'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { User } from '../../../utils/interfaces/user.interface'
import { take } from 'rxjs'
import { Router, RouterModule } from '@angular/router'

describe('UserMenuComponent', () => {
  let component: UserMenuComponent
  let fixture: ComponentFixture<UserMenuComponent>
  let store: MockStore
  let router: Router

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMenuComponent, RouterModule.forRoot([])],
      providers: [provideMockStore()],
    }).compileComponents()

    fixture = TestBed.createComponent(UserMenuComponent)
    component = fixture.componentInstance
    store = TestBed.inject(MockStore)

    fixture.detectChanges()

    jest.spyOn(store, 'dispatch')
    router = TestBed.inject(Router)
    store.overrideSelector(selectCurrentUser, { username: 'test' } as User)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should select currentUser from store', (done) => {
    component.currentUser$.pipe(take(1)).subscribe((user) => {
      expect(user?.username).toEqual('test')
      done()
    })
  })

  describe('logoutUser', () => {
    it('should call logoutUser action and emit event', () => {
      const closeMenuSpy = jest.spyOn(component.closeMenu, 'emit')
      component.logoutUser()

      expect(store.dispatch).toHaveBeenCalledWith(logoutUser())
      expect(closeMenuSpy).toHaveBeenCalled()
    })

    it('should call logoutUser on click', () => {
      const logoutUserSpy = jest.spyOn(component, 'logoutUser')
      const element = fixture.debugElement.query(By.css('p'))
      element.triggerEventHandler('click')

      expect(logoutUserSpy).toHaveBeenCalled()
    })
  })
})
