import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NavbarComponent } from './navbar.component'
import { RouterModule } from '@angular/router'
import { AuthStatus } from '../../../utils/auth-status.enum'
import { By } from '@angular/platform-browser'
import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import {
  selectAuthStatus,
  selectCurrentUser,
} from '../../../store/auth/auth.selectors'
import { User } from '../../../utils/user.interface'

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
  let store: MockStore

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterModule.forRoot([])],
      providers: [provideMockStore()],
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

    store = TestBed.inject(MockStore)
    store.overrideSelector(selectCurrentUser, null)
    store.overrideSelector(selectAuthStatus, AuthStatus.UNAUTHENTICATED)
    store.refreshState()

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should show Sign In button when UNAUTHENTICATED', () => {
    component.ngOnInit()
    fixture.detectChanges()

    const btn = fixture.debugElement.query(By.css('button'))
    expect(btn.nativeElement.textContent).toContain('Sign In')
  })

  it('should show user profile image when AUTHENTICATED', () => {
    const mockUser = {
      id: '1',
      username: 'test',
      imagePath: 'image.png',
    } as User
    store.overrideSelector(selectCurrentUser, mockUser)
    store.overrideSelector(selectAuthStatus, AuthStatus.AUTHENTICATED)
    store.refreshState()

    component.ngOnInit()
    fixture.detectChanges()

    const image = fixture.debugElement.query(By.css('.profile img'))
    expect(image).toBeTruthy()
    expect(image.nativeElement.getAttribute('src')).toEqual(mockUser.imagePath)
  })

  it('should open and close login modal', () => {
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
    component.openMenu()
    fixture.detectChanges()

    let menu = fixture.debugElement.query(By.css('user-menu'))
    expect(component.showMenu).toBe(true)
    expect(menu).toBeTruthy()

    component.closeMenu()
    fixture.detectChanges()

    menu = fixture.debugElement.query(By.css('user-menu'))
    expect(component.showMenu).toBe(false)
    expect(menu).toBeNull()
  })
})
