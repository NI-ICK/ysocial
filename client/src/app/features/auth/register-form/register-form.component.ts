import { Component } from '@angular/core'
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { Apollo } from 'apollo-angular'
import { REGISTER_USER } from '../../../graphql/auth.operations'
import { PasswordFieldComponent } from '../../../shared/password-field/password-field.component'
import { PrintErrorComponent } from '../../../shared/print-error/print-error.component'
import { PopupService } from '../../../shared/popup/popup.service'

@Component({
  selector: 'register-form',
  imports: [ReactiveFormsModule, PasswordFieldComponent, PrintErrorComponent],
  standalone: true,
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss',
})
export class RegisterFormComponent {
  constructor(
    private fb: FormBuilder,
    private apollo: Apollo,
    private popupService: PopupService
  ) {}

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
      group.get('password')?.setErrors({ passwordNoMatch: true })
    } else {
      const errors = group.get('password')?.errors
      if (errors) {
        delete errors['passwordNoMatch']
        if (!Object.keys(errors).length) group.get('password')?.setErrors(null)
      }
    }

    return null
  }

  handleFormSubmit() {
    if (this.registerForm.invalid) return

    this.apollo
      .mutate({
        mutation: REGISTER_USER,
        variables: {
          username: this.registerForm.get('username')?.value,
          email: this.registerForm.get('email')?.value,
          password: this.registerForm.get('password')?.value,
        },
      })
      .subscribe({
        error: (err) => {
          this.popupService.showPopup(err.message || 'Sign Up Failed')
        },
      })
  }

  get passwordControl() {
    return this.registerForm.get('password') as FormControl
  }

  get repeatPasswordControl() {
    return this.registerForm.get('repeatPassword') as FormControl
  }
}
