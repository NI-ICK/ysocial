import { Component, Output, EventEmitter, Input } from '@angular/core'

@Component({
  selector: 'modal-wrapper',
  imports: [],
  templateUrl: './modal-wrapper.component.html',
  styleUrl: './modal-wrapper.component.scss',
})
export class ModalWrapperComponent {
  @Input() backgroundVisible = true
  @Input() position: 'center' | 'side' = 'center'
  @Output() close = new EventEmitter()

  closeModal() {
    this.close.emit()
  }
}
