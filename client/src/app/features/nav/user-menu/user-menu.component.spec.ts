import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UserMenuComponent } from './user-menu.component'
import { By } from '@angular/platform-browser'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { logoutUser } from '../../../store/auth/auth.actions'

describe('UserMenuComponent', () => {
  let component: UserMenuComponent
  let fixture: ComponentFixture<UserMenuComponent>
  let store: MockStore

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMenuComponent],
      providers: [provideMockStore()],
    }).compileComponents()

    fixture = TestBed.createComponent(UserMenuComponent)
    component = fixture.componentInstance
    store = TestBed.inject(MockStore)

    fixture.detectChanges()

    jest.spyOn(store, 'dispatch')
  })

  it('should create', () => {
    expect(component).toBeTruthy()
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
