import { Component, Input, Self } from '@angular/core'
import { FormControl, NgControl, ReactiveFormsModule } from '@angular/forms'
import { NgIf } from '@angular/common'
import { EyeIconComponent } from '../icons/eye-icon/eye-icon.component'
import { EyeOffIconComponent } from '../icons/eye-off-icon/eye-off-icon.component'

@Component({
  selector: 'password-field',
  imports: [ReactiveFormsModule, EyeIconComponent, EyeOffIconComponent, NgIf],
  templateUrl: './password-field.component.html',
  styleUrl: './password-field.component.scss',
})
export class PasswordFieldComponent {
  @Input() placeholder!: string
  @Input() label!: string
  passwordHidden = true

  constructor(@Self() private controlDir: NgControl) {
    this.controlDir.valueAccessor = this
  }

  togglePassword = () => (this.passwordHidden = !this.passwordHidden)

  writeValue() {}
  registerOnChange() {}
  registerOnTouched() {}

  get control(): FormControl {
    return this.controlDir.control as FormControl
  }
}
