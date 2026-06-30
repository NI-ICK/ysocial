import { Component, Output, EventEmitter, HostListener } from '@angular/core'

@Component({
  selector: 'modal-wrapper',
  imports: [],
  templateUrl: './modal-wrapper.component.html',
  styleUrl: './modal-wrapper.component.scss',
})
export class ModalWrapperComponent {
  @Output() close = new EventEmitter()

  @HostListener('document:keydown.escape')
  closeModal() {
    this.close.emit()
  }
}
