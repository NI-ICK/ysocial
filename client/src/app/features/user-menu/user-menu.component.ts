import { Component, EventEmitter, Output } from '@angular/core'
import { AuthService } from '../auth/auth-service/auth.service'

@Component({
  selector: 'user-menu',
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
})
export class UserMenuComponent {
  @Output() closeMenu = new EventEmitter()

  constructor(private authService: AuthService) {}

  logoutUser() {
    this.authService.logoutUser()
    this.closeMenu.emit()
  }
}
