import { Component, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'modal-wrapper',
  imports: [],
  templateUrl: './modal-wrapper.component.html',
  styleUrl: './modal-wrapper.component.scss',
})
export class ModalWrapperComponent {
  @Output() close = new EventEmitter()

  closeModal() {
    this.close.emit()
  }
}
