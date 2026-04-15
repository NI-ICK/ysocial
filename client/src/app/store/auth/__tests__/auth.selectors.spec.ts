import { AuthStatus } from '../../../utils/auth-status.enum'
import { AuthState } from '../auth.state'
import * as AuthSelectors from '../auth.selectors'
import { User } from '../../../utils/interfaces/user.interface'

describe('Auth Selectors', () => {
  const mockUser = { id: '1', username: 'test' } as User

  const mockState: AuthState = {
    user: mockUser,
    status: AuthStatus.AUTHENTICATED,
    loginSuccess: false,
    registerSuccess: false,
  }

  const appState = { auth: mockState }

  it('should select auth feature state', () => {
    const result = AuthSelectors.selectAuthState(appState)

    expect(result).toEqual(mockState)
  })

  it('should select current user', () => {
    const result = AuthSelectors.selectCurrentUser(appState)

    expect(result).toEqual(mockUser)
  })

  it('should select auth status', () => {
    const result = AuthSelectors.selectAuthStatus(appState)

    expect(result).toEqual(AuthStatus.AUTHENTICATED)
  })

  it('should select loginSuccess', () => {
    const result = AuthSelectors.selectLoginSuccess(appState)

    expect(result).toEqual(false)
  })

  it('should select registerSuccess', () => {
    const result = AuthSelectors.selectRegisterSuccess(appState)

    expect(result).toEqual(false)
  })
})
