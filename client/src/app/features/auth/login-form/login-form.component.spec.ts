import { ComponentFixture, TestBed } from '@angular/core/testing'
import { LoginFormComponent } from './login-form.component'
import { By } from '@angular/platform-browser'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { selectLoginSuccess } from '../../../store/auth/auth.selectors'
import { loginUser } from '../../../store/auth/auth.actions'

describe('LoginFormComponent', () => {
  let component: LoginFormComponent
  let fixture: ComponentFixture<LoginFormComponent>
  let store: MockStore

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginFormComponent],
      providers: [provideMockStore()],
    }).compileComponents()

    fixture = TestBed.createComponent(LoginFormComponent)
    component = fixture.componentInstance
    store = TestBed.inject(MockStore)

    fixture.detectChanges()

    jest.spyOn(store, 'dispatch')
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should emit loginSuccess when login is successfull', () => {
    const loginSuccessSpy = jest.spyOn(component.loginSuccess, 'emit')

    store.overrideSelector(selectLoginSuccess, false)

    component.ngOnInit()

    store.overrideSelector(selectLoginSuccess, true)
    store.refreshState()

    expect(loginSuccessSpy).toHaveBeenCalled()
  })

  it('should emit openRegisterModal when clicking Sign Up span', async () => {
    const openRegisterModalSpy = jest.spyOn(component.openRegisterModal, 'emit')
    const span = fixture.debugElement.query(By.css('.message span'))

    span.triggerEventHandler('click')

    expect(openRegisterModalSpy).toHaveBeenCalled()
  })

  describe('handleFormSubmit', () => {
    it('should return if form is invalid', () => {
      component.loginForm.setValue({ email: '', password: '' })

      component.handleFormSubmit()

      expect(store.dispatch).not.toHaveBeenCalled()
    })

    it('should call dispatch if form is valid', () => {
      component.loginForm.setValue({ email: 'test@test.com', password: 'test' })

      component.handleFormSubmit()

      expect(store.dispatch).toHaveBeenCalledWith(
        loginUser({ email: 'test@test.com', password: 'test' })
      )
    })
  })
})
