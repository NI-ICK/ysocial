import { CommonModule, NgIf } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Observable } from 'rxjs'
import { AuthService } from '../../../features/auth/auth-service/auth.service'
import { LoginFormComponent } from '../../../features/auth/login-form/login-form.component'
import { RegisterFormComponent } from '../../../features/auth/register-form/register-form.component'
import { UserMenuComponent } from '../../../features/nav/user-menu/user-menu.component'
import { ModalWrapperComponent } from '../../../shared/modal-wrapper/modal-wrapper.component'
import { AuthState } from '../../../utils/auth-state.enum'
import { User } from '../../../utils/user.interface'
import { ImagePreloadDirective } from '../../../shared/directives/image-preload/image-preload.directive'

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
  public AuthState = AuthState
  showLoginModal = false
  showRegisterModal = false
  showMenu = false
  currentUser$!: Observable<User | null>
  authState$!: Observable<AuthState | null>

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUser$ = this.authService.getCurrentUser()
    this.authState$ = this.authService.getAuthState()
  }

  openLoginModal = () => (this.showLoginModal = true)
  closeLoginModal = () => (this.showLoginModal = false)

  openRegisterModal = () => (this.showRegisterModal = true)
  closeRegisterModal = () => (this.showRegisterModal = false)

  openMenu = () => (this.showMenu = true)
  closeMenu = () => (this.showMenu = false)
}
