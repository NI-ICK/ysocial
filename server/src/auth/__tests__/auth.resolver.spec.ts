import { Test, TestingModule } from '@nestjs/testing'
import { AuthResolver } from '../auth.resolver'
import { AuthService } from '../auth.service'
import { User } from 'src/users/user.entity'
import { Response } from 'express'

describe('AuthResolver', () => {
  let authResolver: AuthResolver
  let authService: Partial<AuthService>

  beforeEach(async () => {
    authService = {
      loginUser: jest.fn(),
      registerUser: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: authService },
      ],
    }).compile()

    authResolver = module.get<AuthResolver>(AuthResolver)
  })

  it('should be defined', () => {
    expect(authResolver).toBeDefined()
    expect(authService).toBeDefined()
  })

  describe('loginUser', () => {
    it('should call authService.loginUser with res and user', async () => {
      const user = { id: '1' } as User
      const res = {} as Response

      ;(authService.loginUser as jest.Mock).mockResolvedValue({
        access_token: 'token',
      })
      const result = await authResolver.loginUser(
        { email: 'test@test.com', password: 'pass' },
        { res, user },
      )

      expect(authService.loginUser).toHaveBeenCalledWith(res, user)
      expect(result).toEqual({ access_token: 'token' })
    })
  })

  describe('logoutUser', () => {
    it('should clear access_token cookie', () => {
      const res = {
        clearCookie: jest.fn(),
      } as Partial<Response>

      const result = authResolver.logoutUser(res as Response)

      expect(res.clearCookie).toHaveBeenCalledWith('access_token')
      expect(result).toEqual({ success: true })
    })
  })

  describe('registerUser', () => {
    it('should call authService.registerUser', async () => {
      const input = {
        email: 'test@test.com',
        username: 'user',
        password: 'pass',
      }
      ;(authService.registerUser as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        username: 'user',
      })

      const result = await authResolver.registerUser(input)

      expect(authService.registerUser).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'pass',
        username: 'user',
      })
      expect(result).toEqual({
        id: '1',
        email: 'test@test.com',
        username: 'user',
      })
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      const user = { id: '1' } as Partial<User>

      expect(authResolver.getCurrentUser(user as User)).toBe(user)
    })
  })
})
