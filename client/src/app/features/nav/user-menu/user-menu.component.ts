import { Component, EventEmitter, Output } from '@angular/core'
import { Store } from '@ngrx/store'
import { logoutUser } from '../../../store/auth/auth.actions'

@Component({
  selector: 'user-menu',
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
})
export class UserMenuComponent {
  @Output() closeMenu = new EventEmitter()

  constructor(private store: Store) {}

  logoutUser() {
    this.store.dispatch(logoutUser())
    this.closeMenu.emit()
  }
}
