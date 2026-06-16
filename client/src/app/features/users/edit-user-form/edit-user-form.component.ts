import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { firstValueFrom, Observable, take } from 'rxjs'
import { User } from '../../../utils/interfaces/user.interface'
import { Store } from '@ngrx/store'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { UsersService } from '../users-service/users.service'
import { deleteUser, updateUser } from '../../../store/users/users.actions'
import { PasswordFieldComponent } from '../../../shared/password-field/password-field.component'
import { Router } from '@angular/router'
import { PrintErrorComponent } from '../../../shared/print-error/print-error.component'
import { NgIf } from '@angular/common'
import { ModalWrapperComponent } from '../../../shared/modal-wrapper/modal-wrapper.component'
import { PopupService } from '../../../shared/popup/popup.service'

@Component({
  selector: 'edit-user-form',
  imports: [
    ReactiveFormsModule,
    PasswordFieldComponent,
    PrintErrorComponent,
    NgIf,
    ModalWrapperComponent,
  ],
  templateUrl: './edit-user-form.component.html',
  styleUrl: './edit-user-form.component.scss',
})
export class EditUserFormComponent implements OnInit {
  currentUser$ = new Observable<User | null>()
  @Output() submitSuccess = new EventEmitter()
  private fb: FormBuilder = new FormBuilder()
  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>
  showConfirmDelete = false
  editForm = this.fb.group(
    {
      username: ['', []],
      bio: ['', []],
      password: ['', []],
      repeatPassword: ['', []],
      email: ['', [Validators.email]],
      repeatEmail: ['', [Validators.email]],
    },
    {
      validators: [this.repeatPasswordValidator, this.repeatEmailValidator],
    }
  )

  constructor(
    private store: Store,
    private usersService: UsersService,
    private router: Router,
    private popupService: PopupService
  ) {}

  ngOnInit() {
    this.currentUser$ = this.store.select(selectCurrentUser)

    this.editForm.get('bio')?.valueChanges.subscribe(() => {
      this.resizeTextarea()
    })
  }

  resizeTextarea() {
    const textarea = this.textareaRef.nativeElement

    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  async handleSubmit() {
    const values = this.editForm.value

    const hasAnyValue = Object.values(values).some((v) => v?.toString().trim())

    if (!hasAnyValue) {
      this.editForm.setErrors({ atLeastOneRequired: true })
      this.editForm.markAllAsTouched()
      return
    }

    if (!this.editForm.valid) return

    const username = this.editForm.get('username')?.value
    const bio = this.editForm.get('bio')?.value
    const password = this.editForm.get('password')?.value
    const email = this.editForm.get('email')?.value

    if (username) {
      const result = await firstValueFrom(
        this.usersService.isUsernameTaken(username)
      )

      if (result.data?.isUsernameTaken)
        return this.popupService.showPopup('Username is already taken')
    }

    if (email) {
      const result = await firstValueFrom(this.usersService.isEmailTaken(email))

      if (result.data?.isEmailTaken)
        return this.popupService.showPopup('Email is already taken')
    }

    this.store.dispatch(
      updateUser({
        newUsername: username,
        newBio: bio,
        newPassword: password,
        newEmail: email,
      })
    )

    if (username) this.router.navigate(['/', username])

    this.submitSuccess.emit()
  }

  get passwordControl() {
    return this.editForm.get('password') as FormControl
  }

  get repeatPasswordControl() {
    return this.editForm.get('repeatPassword') as FormControl
  }

  openConfirmDelete = () => (this.showConfirmDelete = true)
  closeConfirmDelete = () => (this.showConfirmDelete = false)

  handleDeleteUser() {
    this.store.dispatch(deleteUser())
    this.router.navigate(['/'])
  }

  repeatPasswordValidator(group: AbstractControl) {
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

  repeatEmailValidator(group: AbstractControl) {
    const email = group.get('email')?.value
    const repeatEmail = group.get('repeatEmail')?.value

    if (email && repeatEmail && email !== repeatEmail) {
      group.get('email')?.setErrors({ emailMismatch: true })
    } else {
      const errors = group.get('email')?.errors
      if (errors) {
        delete errors['emailMismatch']
        if (!Object.keys(errors).length) group.get('email')?.setErrors(null)
      }
    }

    return null
  }
}
