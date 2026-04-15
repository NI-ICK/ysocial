import { Component, OnInit } from '@angular/core'
import { Popup } from '../../utils/interfaces/popup.interface'
import { PopupService } from './popup.service'

@Component({
  selector: 'popup',
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss',
})
export class PopupComponent implements OnInit {
  popup: Popup | null = null

  constructor(private popupService: PopupService) {}

  ngOnInit() {
    this.popupService.popup$.subscribe((popup) => {
      this.popup = popup
    })
  }
}
