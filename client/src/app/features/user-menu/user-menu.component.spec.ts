import { ComponentFixture, TestBed } from '@angular/core/testing'

import { UserMenuComponent } from './user-menu.component'
import { AuthService } from '../auth/auth-service/auth.service'
import { By } from '@angular/platform-browser'

describe('UserMenuComponent', () => {
  let component: UserMenuComponent
  let fixture: ComponentFixture<UserMenuComponent>
  let authServiceMock: Partial<AuthService>

  beforeEach(async () => {
    authServiceMock = {
      logoutUser: jest.fn(),
    }

    await TestBed.configureTestingModule({
      imports: [UserMenuComponent],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents()

    fixture = TestBed.createComponent(UserMenuComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('logoutUser', () => {
    it('should call authService.logoutUser and emit event', () => {
      const closeMenuSpy = jest.spyOn(component.closeMenu, 'emit')
      component.logoutUser()

      expect(authServiceMock.logoutUser).toHaveBeenCalled()
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
