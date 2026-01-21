import { Component, EventEmitter, Output } from '@angular/core'
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { Apollo } from 'apollo-angular'
import { LOGIN_USER } from '../../../graphql/graphql.operations'
import { GoogleIconComponent } from '../../../shared/icons/google-icon/google-icon.component'
import { PasswordFieldComponent } from '../../../shared/password-field/password-field.component'
import { GithubIconComponent } from '../../../shared/icons/github-icon/github-icon.component'
import { environment } from '../../../../environments/environment.development'
import { AuthService } from '../auth-service/auth.service'
import { PrintErrorComponent } from '../../../shared/print-error/print-error.component'
import { PopupService } from '../../../shared/popup/popup.service'

@Component({
  selector: 'login-form',
  imports: [
    ReactiveFormsModule,
    GoogleIconComponent,
    PasswordFieldComponent,
    GithubIconComponent,
    PrintErrorComponent,
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  @Output() loginSuccess = new EventEmitter()
  @Output() openRegisterModal = new EventEmitter()
  private fb: FormBuilder = new FormBuilder()

  constructor(
    private apollo: Apollo,
    private authService: AuthService,
    private popupService: PopupService
  ) {}

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  })

  handleGoogleLogin() {
    window.location.href = environment.GOOGLE_REDIRECT_URL
  }

  handleGithubLogin() {
    window.location.href = environment.GITHUB_REDIRECT_URL
  }

  handleFormSubmit() {
    if (this.loginForm.invalid) return

    this.apollo
      .mutate({
        mutation: LOGIN_USER,
        variables: {
          email: this.loginForm.get('email')?.value,
          password: this.loginForm.get('password')?.value,
        },
      })
      .subscribe({
        next: () => {
          this.authService.loadUser()
          this.loginSuccess.emit()
        },
        error: (err) => {
          console.log(err)
          this.popupService.showPopup(err.message || 'Sign In Failed')
        },
      })
  }

  get passwordControl() {
    return this.loginForm.get('password') as FormControl
  }
}
