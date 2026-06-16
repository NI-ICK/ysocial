import { ComponentFixture, TestBed } from '@angular/core/testing'
import { RegisterFormComponent } from './register-form.component'
import { FormBuilder, Validators } from '@angular/forms'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { registerUser } from '../../../store/auth/auth.actions'
import { selectRegisterSuccess } from '../../../store/auth/auth.selectors'

describe('RegisterFormComponent', () => {
  let component: RegisterFormComponent
  let fixture: ComponentFixture<RegisterFormComponent>
  let store: MockStore

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterFormComponent],
      providers: [provideMockStore()],
    }).compileComponents()

    fixture = TestBed.createComponent(RegisterFormComponent)
    component = fixture.componentInstance
    store = TestBed.inject(MockStore)
    fixture.detectChanges()

    jest.spyOn(store, 'dispatch')
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should emit registerSuccess when register is successfull', () => {
    const registerSuccessSpy = jest.spyOn(component.registerSuccess, 'emit')

    store.overrideSelector(selectRegisterSuccess, false)

    component.ngOnInit()

    store.overrideSelector(selectRegisterSuccess, true)
    store.refreshState()

    expect(registerSuccessSpy).toHaveBeenCalled()
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

      expect(store.dispatch).not.toHaveBeenCalled()
    })

    it('should call dispatch if form is valid', () => {
      component.registerForm.setValue({
        username: 'test',
        email: 'test@gmail.com',
        password: 'test',
        repeatPassword: 'test',
      })

      component.handleFormSubmit()

      expect(store.dispatch).toHaveBeenCalledWith(
        registerUser({
          username: 'test',
          email: 'test@gmail.com',
          password: 'test',
        })
      )
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

      expect(form.get('password')?.getError('passwordMismatch')).toBe(true)
    })
  })
})
