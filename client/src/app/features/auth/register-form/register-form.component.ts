import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { PasswordFieldComponent } from '../../../shared/password-field/password-field.component'
import { PrintErrorComponent } from '../../../shared/print-error/print-error.component'
import { Store } from '@ngrx/store'
import { registerUser } from '../../../store/auth/auth.actions'
import { filter, take } from 'rxjs'
import { selectRegisterSuccess } from '../../../store/auth/auth.selectors'

@Component({
  selector: 'register-form',
  imports: [ReactiveFormsModule, PasswordFieldComponent, PrintErrorComponent],
  standalone: true,
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss',
})
export class RegisterFormComponent implements OnInit {
  @Output() registerSuccess = new EventEmitter()

  constructor(private fb: FormBuilder, private store: Store) {}

  ngOnInit(): void {
    this.store
      .select(selectRegisterSuccess)
      .pipe(
        filter((success) => success),
        take(1)
      )
      .subscribe(() => {
        this.registerSuccess.emit()
      })
  }

  registerForm = this.fb.group(
    {
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      repeatPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator }
  )

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value
    const repeatPassword = group.get('repeatPassword')?.value

    if (password && repeatPassword && password !== repeatPassword) {
      group.get('password')?.setErrors({ passwordMismatch: true })
    } else {
      const errors = group.get('password')?.errors
      if (errors) {
        delete errors['passwordMismatch']
        if (!Object.keys(errors).length) group.get('password')?.setErrors(null)
      }
    }

    return null
  }

  handleFormSubmit() {
    if (this.registerForm.invalid) return

    const username = this.registerForm.get('username')?.value!
    const email = this.registerForm.get('email')?.value!
    const password = this.registerForm.get('password')?.value!

    this.store.dispatch(registerUser({ username, email, password }))
  }

  get passwordControl() {
    return this.registerForm.get('password') as FormControl
  }

  get repeatPasswordControl() {
    return this.registerForm.get('repeatPassword') as FormControl
  }
}
