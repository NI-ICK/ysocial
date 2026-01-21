import { NgIf } from '@angular/common'
import { Component, Input } from '@angular/core'
import { AbstractControl } from '@angular/forms'

@Component({
  selector: 'print-error',
  imports: [NgIf],
  templateUrl: './print-error.component.html',
  styleUrl: './print-error.component.scss',
})
export class PrintErrorComponent {
  @Input() control: AbstractControl | null = null

  hasError(error: string) {
    const hasError = this.control?.getError(error)
    const interacted = this.control?.dirty || this.control?.touched

    return !!hasError && interacted
  }
}
