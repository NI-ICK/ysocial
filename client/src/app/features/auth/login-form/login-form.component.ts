import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { GoogleIconComponent } from '../../../shared/icons/google-icon/google-icon.component'
import { PasswordFieldComponent } from '../../../shared/password-field/password-field.component'
import { GithubIconComponent } from '../../../shared/icons/github-icon/github-icon.component'
import { environment } from '../../../../environments/environment.development'
import { PrintErrorComponent } from '../../../shared/print-error/print-error.component'
import { Store } from '@ngrx/store'
import { loginUser } from '../../../store/auth/auth.actions'
import { filter, take } from 'rxjs'
import { selectLoginSuccess } from '../../../store/auth/auth.selectors'

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
export class LoginFormComponent implements OnInit {
  @Output() loginSuccess = new EventEmitter()
  @Output() openRegisterModal = new EventEmitter()
  private fb: FormBuilder = new FormBuilder()

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store
      .select(selectLoginSuccess)
      .pipe(
        filter((success) => success),
        take(1)
      )
      .subscribe(() => {
        this.loginSuccess.emit()
      })
  }

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

    const email = this.loginForm.get('email')?.value!
    const password = this.loginForm.get('password')?.value!

    this.store.dispatch(loginUser({ email, password }))
  }

  get passwordControl() {
    return this.loginForm.get('password') as FormControl
  }
}
