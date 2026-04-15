import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { Popup } from '../../utils/interfaces/popup.interface'

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  private popupSubject = new BehaviorSubject<Popup | null>(null)
  popup$ = this.popupSubject.asObservable()

  showPopup(message: string, duration: number = 5000) {
    this.popupSubject.next({ message, duration })

    setTimeout(() => {
      this.popupSubject.next(null)
    }, duration)
  }
}
