import { AuthStatus } from '../../utils/auth-status.enum'
import { User } from '../../utils/user.interface'

export interface AuthState {
  user: User | null
  status: AuthStatus
  loginSuccess: boolean
  registerSuccess: boolean
}

export const initialState: AuthState = {
  user: null,
  status: AuthStatus.LOADING,
  loginSuccess: false,
  registerSuccess: false,
}
