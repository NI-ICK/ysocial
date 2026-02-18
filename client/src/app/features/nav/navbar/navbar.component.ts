import { CommonModule, NgIf } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Observable } from 'rxjs'
import { LoginFormComponent } from '../../../features/auth/login-form/login-form.component'
import { RegisterFormComponent } from '../../../features/auth/register-form/register-form.component'
import { UserMenuComponent } from '../../../features/nav/user-menu/user-menu.component'
import { ModalWrapperComponent } from '../../../shared/modal-wrapper/modal-wrapper.component'
import { AuthStatus } from '../../../utils/auth-status.enum'
import { User } from '../../../utils/user.interface'
import { ImagePreloadDirective } from '../../../shared/directives/image-preload/image-preload.directive'
import { Store } from '@ngrx/store'
import {
  selectAuthStatus,
  selectCurrentUser,
} from '../../../store/auth/auth.selectors'

@Component({
  selector: 'navbar',
  imports: [
    RouterLink,
    ModalWrapperComponent,
    LoginFormComponent,
    NgIf,
    CommonModule,
    RegisterFormComponent,
    UserMenuComponent,
    ImagePreloadDirective,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  public AuthStatus = AuthStatus
  showLoginModal = false
  showRegisterModal = false
  showMenu = false
  currentUser$!: Observable<User | null>
  authStatus$!: Observable<AuthStatus | null>

  constructor(private store: Store) {}

  ngOnInit() {
    this.currentUser$ = this.store.select(selectCurrentUser)
    this.authStatus$ = this.store.select(selectAuthStatus)
  }

  openLoginModal = () => (this.showLoginModal = true)
  closeLoginModal = () => (this.showLoginModal = false)

  openRegisterModal = () => (this.showRegisterModal = true)
  closeRegisterModal = () => (this.showRegisterModal = false)

  openMenu = () => (this.showMenu = true)
  closeMenu = () => (this.showMenu = false)
}
