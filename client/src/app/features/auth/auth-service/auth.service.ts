import { Injectable } from '@angular/core'
import { Apollo } from 'apollo-angular'
import {
  GET_CURRENT_USER,
  LOGIN_USER,
  LOGOUT_USER,
  REGISTER_USER,
} from '../../../graphql/auth.operations'
import { User } from '../../../utils/user.interface'
import { tap } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private apollo: Apollo) {}

  loginUser(email: string, password: string) {
    return this.apollo.mutate({
      mutation: LOGIN_USER,
      variables: {
        email,
        password,
      },
    })
  }

  registerUser(username: string, email: string, password: string) {
    return this.apollo.mutate({
      mutation: REGISTER_USER,
      variables: {
        username,
        email,
        password,
      },
    })
  }

  getCurrentUser() {
    return this.apollo.query<{ getCurrentUser: User }>({
      query: GET_CURRENT_USER,
    })
  }

  logoutUser() {
    return this.apollo
      .mutate({
        mutation: LOGOUT_USER,
      })
      .pipe(
        tap(() => {
          this.apollo.client.clearStore()
        })
      )
  }
}
