import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RegisterFormComponent } from './register-form.component'
import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing'
import { REGISTER_USER } from '../../../graphql/auth.operations'
import { FormBuilder, Validators } from '@angular/forms'

describe('RegisterFormComponent', () => {
  let component: RegisterFormComponent
  let apolloController: ApolloTestingController
  let fixture: ComponentFixture<RegisterFormComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterFormComponent, ApolloTestingModule],
    }).compileComponents()

    fixture = TestBed.createComponent(RegisterFormComponent)
    component = fixture.componentInstance
    apolloController = TestBed.inject(ApolloTestingController)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(apolloController).toBeTruthy()
  })

  describe('handleFormSubmit', () => {
    it('should return if form is invalid', () => {
      component.registerForm.setValue({
        username: '',
        email: '',
        password: '',
        repeatPassword: '',
      })

      component.handleFormSubmit()

      expect(() => apolloController.expectOne(REGISTER_USER)).toThrow()
    })

    it('should call REGISTER_USER mutation if form is valid', () => {
      component.registerForm.setValue({
        username: 'test',
        email: 'test@gmail.com',
        password: 'test',
        repeatPassword: 'test',
      })

      component.handleFormSubmit()

      const op = apolloController.expectOne(REGISTER_USER)
      op.flush({
        data: {
          registerUserData: {
            id: '1',
            username: 'test',
            email: 'test@gmail.com',
          },
        },
      })
      apolloController.verify()
    })
  })

  describe('passwordMatchValidator', () => {
    let fb: FormBuilder

    beforeEach(() => (fb = new FormBuilder()))

    function createForm(password: string, repeatPassword: string) {
      return fb.group(
        {
          username: [''],
          email: [''],
          password: [password, Validators.required],
          repeatPassword: [repeatPassword, Validators.required],
        },
        { validators: component.passwordMatchValidator }
      )
    }

    it('should NOT set an error when passwords match', () => {
      const form = createForm('test', 'test')

      expect(form.get('password')?.errors).toBe(null)
    })

    it('should set error if passwords do not match', () => {
      const form = createForm('test1', 'test2')

      expect(form.get('password')?.getError('passwordNoMatch')).toBe(true)
    })
  })
})
