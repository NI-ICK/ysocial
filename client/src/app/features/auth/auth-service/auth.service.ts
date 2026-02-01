import { isPlatformBrowser } from '@angular/common'
import { Inject, Injectable, PLATFORM_ID } from '@angular/core'
import { Apollo } from 'apollo-angular'
import { BehaviorSubject } from 'rxjs'
import { GET_CURRENT_USER, LOGOUT_USER } from '../../../graphql/auth.operations'
import { AuthState } from '../../../utils/auth-state.enum'
import { User } from '../../../utils/user.interface'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser = new BehaviorSubject<User | null>(null)
  private authState = new BehaviorSubject<AuthState>(AuthState.LOADING)

  constructor(
    private apollo: Apollo,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) this.loadUser()
  }

  getCurrentUser = () => this.currentUser.asObservable()
  getAuthState = () => this.authState.asObservable()

  loadUser() {
    this.apollo
      .query<{ getCurrentUser: User }>({
        query: GET_CURRENT_USER,
      })
      .subscribe({
        next: ({ data }) => {
          if (data?.getCurrentUser) {
            this.currentUser.next(data.getCurrentUser)
            this.authState.next(AuthState.AUTHENTICATED)
          } else {
            this.currentUser.next(null)
            this.authState.next(AuthState.UNAUTHENTICATED)
          }
        },
        error: (err) => {
          console.log(err)
          this.currentUser.next(null)
          this.authState.next(AuthState.UNAUTHENTICATED)
        },
      })
  }

  logoutUser() {
    this.apollo
      .mutate({
        mutation: LOGOUT_USER,
      })
      .subscribe({
        next: () => {
          this.currentUser.next(null)
          this.authState.next(AuthState.UNAUTHENTICATED)
        },
        error: () => {
          this.currentUser.next(null)
          this.authState.next(AuthState.UNAUTHENTICATED)
        },
      })
  }
}
