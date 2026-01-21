import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NavbarComponent } from './navbar.component'
import { AuthService } from '../auth/auth-service/auth.service'
import { RouterModule } from '@angular/router'
import { of } from 'rxjs'
import { AuthState } from '../../utils/auth-state.enum'
import { By } from '@angular/platform-browser'
import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({ selector: 'modal-wrapper' })
class ModalWrapperComponentMock {
  @Input() backgroundVisible?: boolean
}

@Component({ selector: 'login-form' })
class LoginFormComponentMock {}

@Component({ selector: 'user-menu' })
class UserMenuComponentMock {}

describe('NavbarComponent', () => {
  let component: NavbarComponent
  let fixture: ComponentFixture<NavbarComponent>
  let authServiceMock: Partial<AuthService>

  beforeEach(async () => {
    authServiceMock = {
      getCurrentUser: jest.fn(),
      getAuthState: jest.fn(),
    }

    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterModule.forRoot([])],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    })
      .overrideComponent(NavbarComponent, {
        set: {
          imports: [
            ModalWrapperComponentMock,
            LoginFormComponentMock,
            UserMenuComponentMock,
            CommonModule,
          ],
        },
      })
      .compileComponents()

    fixture = TestBed.createComponent(NavbarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    ;(authServiceMock.getCurrentUser as jest.Mock).mockReturnValue(of(null))
    ;(authServiceMock.getAuthState as jest.Mock).mockReturnValue(
      of(AuthState.UNAUTHENTICATED)
    )
    expect(component).toBeTruthy()
  })

  it('should show Sign In button when UNAUTHENTICATED', () => {
    ;(authServiceMock.getCurrentUser as jest.Mock).mockReturnValue(of(null))
    ;(authServiceMock.getAuthState as jest.Mock).mockReturnValue(
      of(AuthState.UNAUTHENTICATED)
    )

    component.ngOnInit()
    fixture.detectChanges()

    const btn = fixture.debugElement.query(By.css('button'))
    expect(btn.nativeElement.textContent).toContain('Sign In')
  })

  it('should show user profile image when AUTHENTICATED', () => {
    const mockUser = { id: '1', username: 'test', imagePath: 'image.png' }
    ;(authServiceMock.getCurrentUser as jest.Mock).mockReturnValue(of(mockUser))
    ;(authServiceMock.getAuthState as jest.Mock).mockReturnValue(
      of(AuthState.AUTHENTICATED)
    )

    component.ngOnInit()
    fixture.detectChanges()

    const image = fixture.debugElement.query(By.css('.profile img'))
    expect(image).toBeTruthy()
    expect(image.nativeElement.getAttribute('src')).toEqual(mockUser.imagePath)
  })

  it('should open and close login modal', () => {
    ;(authServiceMock.getCurrentUser as jest.Mock).mockReturnValue(of(null))
    ;(authServiceMock.getAuthState as jest.Mock).mockReturnValue(
      of(AuthState.UNAUTHENTICATED)
    )

    component.openLoginModal()
    fixture.detectChanges()

    let modal = fixture.debugElement.query(By.css('modal-wrapper'))
    expect(component.showLoginModal).toBe(true)
    expect(modal).toBeTruthy()

    component.closeLoginModal()
    fixture.detectChanges()

    modal = fixture.debugElement.query(By.css('modal-wrapper'))
    expect(component.showLoginModal).toBe(false)
    expect(modal).toBeNull()
  })

  it('should open and close user menu', () => {
    ;(authServiceMock.getCurrentUser as jest.Mock).mockReturnValue(of(null))
    ;(authServiceMock.getAuthState as jest.Mock).mockReturnValue(
      of(AuthState.UNAUTHENTICATED)
    )

    component.openMenu()
    fixture.detectChanges()

    let modal = fixture.debugElement.query(By.css('modal-wrapper'))
    expect(component.showMenu).toBe(true)
    expect(modal).toBeTruthy()

    component.closeMenu()
    fixture.detectChanges()

    modal = fixture.debugElement.query(By.css('modal-wrapper'))
    expect(component.showMenu).toBe(false)
    expect(modal).toBeNull()
  })
})
