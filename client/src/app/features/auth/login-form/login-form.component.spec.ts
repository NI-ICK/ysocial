import { ComponentFixture, TestBed } from '@angular/core/testing'
import { LoginFormComponent } from './login-form.component'
import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing'
import { LOGIN_USER } from '../../../graphql/auth.operations'
import { AuthService } from '../auth-service/auth.service'
import { By } from '@angular/platform-browser'

describe('LoginFormComponent', () => {
  let component: LoginFormComponent
  let apolloController: ApolloTestingController
  let fixture: ComponentFixture<LoginFormComponent>
  const authServiceMock = {
    loadUser: jest.fn(),
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginFormComponent, ApolloTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents()

    fixture = TestBed.createComponent(LoginFormComponent)
    component = fixture.componentInstance
    apolloController = TestBed.inject(ApolloTestingController)

    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(apolloController).toBeTruthy()
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

      expect(() => apolloController.expectOne(LOGIN_USER)).toThrow()
    })

    it('should call LOGIN_USER mutation if form is valid', () => {
      component.loginForm.setValue({ email: 'test@test.com', password: 'test' })

      component.handleFormSubmit()

      const op = apolloController.expectOne(LOGIN_USER)
      op.flush({ data: { loginUserData: { token: '123' } } })
      apolloController.verify()
    })

    it('should emit loginSuccess on mutation success', async () => {
      const loginSuccessSpy = jest.spyOn(component.loginSuccess, 'emit')
      component.loginForm.setValue({ email: 'test@test.com', password: 'test' })

      component.handleFormSubmit()

      const op = apolloController.expectOne(LOGIN_USER)
      op.flush({ data: { loginUserData: { access_token: '123' } } })
      apolloController.verify()

      await fixture.whenStable()

      expect(authServiceMock.loadUser).toHaveBeenCalled()
      expect(loginSuccessSpy).toHaveBeenCalled()
    })
  })
})
