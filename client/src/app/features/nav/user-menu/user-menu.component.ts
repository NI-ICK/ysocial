import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { Store } from '@ngrx/store'
import { logoutUser } from '../../../store/auth/auth.actions'
import { RouterLink } from '@angular/router'
import { Observable } from 'rxjs'
import { User } from '../../../utils/interfaces/user.interface'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { CommonModule, NgIf } from '@angular/common'

@Component({
  selector: 'user-menu',
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
  imports: [RouterLink, NgIf, CommonModule],
})
export class UserMenuComponent implements OnInit {
  @Output() closeMenu = new EventEmitter()
  currentUser$ = new Observable<User | null>()

  constructor(private store: Store) {}

  ngOnInit() {
    this.currentUser$ = this.store.select(selectCurrentUser)
  }

  logoutUser() {
    this.store.dispatch(logoutUser())
    this.closeMenu.emit()
  }
}
