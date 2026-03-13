import { TestBed } from '@angular/core/testing'
import { AuthService } from './auth.service'
import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing'
import {
  GET_CURRENT_USER,
  LOGIN_USER,
  LOGOUT_USER,
  REGISTER_USER,
} from '../../../graphql/auth.operations'

describe('AuthService', () => {
  let authService: AuthService
  let apolloController: ApolloTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
    })
    authService = TestBed.inject(AuthService)
    apolloController = TestBed.inject(ApolloTestingController)
  })

  it('should be created', () => {
    expect(authService).toBeTruthy()
    expect(apolloController).toBeTruthy()
  })

  it('should login user', (done) => {
    authService.loginUser('test@gmail.com', 'test').subscribe((result: any) => {
      expect(result.data.loginUser.id).toEqual('1')
      expect(result.data.loginUser.email).toEqual('test@gmail.com')
      done()
    })

    const op = apolloController.expectOne(LOGIN_USER)
    op.flush({ data: { loginUser: { id: '1', email: 'test@gmail.com' } } })
    apolloController.verify()
  })

  it('should register user', (done) => {
    authService
      .registerUser('test', 'test@gmail.com', 'test')
      .subscribe((result: any) => {
        expect(result.data.registerUser.id).toEqual('1')
        expect(result.data.registerUser.email).toEqual('test@gmail.com')
        done()
      })

    const op = apolloController.expectOne(REGISTER_USER)
    op.flush({ data: { registerUser: { id: '1', email: 'test@gmail.com' } } })
    apolloController.verify()
  })

  it('should get current user', (done) => {
    authService.getCurrentUser().subscribe((result: any) => {
      expect(result.data.getCurrentUser.id).toEqual('1')
      expect(result.data.getCurrentUser.email).toEqual('test@gmail.com')
      done()
    })

    const op = apolloController.expectOne(GET_CURRENT_USER)
    op.flush({ data: { getCurrentUser: { id: '1', email: 'test@gmail.com' } } })
    apolloController.verify()
  })

  it('should logout user', (done) => {
    authService.logoutUser().subscribe((result: any) => {
      expect(result.data.logoutUser.success).toEqual(true)
      done()
    })

    const op = apolloController.expectOne(LOGOUT_USER)
    op.flush({ data: { logoutUser: { success: true } } })
    apolloController.verify()
  })
})
