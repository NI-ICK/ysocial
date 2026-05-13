import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../auth.service'
import { UsersService } from 'src/users/users.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UnauthorizedException } from '@nestjs/common'
import { Response } from 'express'
import { AuthProvider } from 'src/utils/auth-provider.enum'
import { User } from 'src/users/user.entity'

describe('AuthService', () => {
  let authService: AuthService
  let usersService: Partial<UsersService>
  let jwtService: Partial<JwtService>

  beforeEach(async () => {
    usersService = {
      getUserBy: jest.fn(),
      createUser: jest.fn(),
    }
    jwtService = {
      signAsync: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(authService).toBeDefined()
    expect(usersService).toBeDefined()
  })

  describe('validateUser', () => {
    it('should return user if credentials are correct', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        provider: AuthProvider.LOCAL,
        password: await bcrypt.hash('pass', 10),
      }
      ;(usersService.getUserBy as jest.Mock).mockResolvedValue(mockUser)

      const result = await authService.validateUser(mockUser.email, 'pass')
      expect(result).toEqual(mockUser)
    })

    it('should throw UnauthorizedException if user has different provider than local', async () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        provider: AuthProvider.GOOGLE,
        password: await bcrypt.hash('pass', 10),
      }
      ;(usersService.getUserBy as jest.Mock).mockResolvedValue(mockUser)

      await expect(
        authService.validateUser(mockUser.email, 'pass'),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException if user not found', async () => {
      ;(usersService.getUserBy as jest.Mock).mockResolvedValue(null)
      await expect(
        authService.validateUser('wrong@gmail.com', 'pass'),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockUser = {
        id: '1',
        email: 'mail@gmail.com',
        password: await bcrypt.hash('pass', 10),
      }
      ;(usersService.getUserBy as jest.Mock).mockResolvedValue(mockUser)

      await expect(
        authService.validateUser(mockUser.email, 'wrong'),
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('validateOAuthUser', () => {
    it('should return user if user already exists in database', async () => {
      const mockUser = { username: 'user', providerId: '123' }
      ;(usersService.getUserBy as jest.Mock).mockResolvedValue(mockUser)

      const result = await authService.validateOAuthUser(
        'test@test.com',
        'user',
        AuthProvider.GOOGLE,
        '123',
        '',
      )

      expect(usersService.getUserBy).toHaveBeenCalled()
      expect(usersService.createUser).not.toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('should create and return new user if not found', async () => {
      const mockUser = {
        id: '1',
        username: 'user',
        email: 'test@test.com',
        provider: AuthProvider.GOOGLE,
      }

      ;(usersService.getUserBy as jest.Mock).mockResolvedValue(null)
      ;(usersService.createUser as jest.Mock).mockResolvedValue(mockUser)

      const result = await authService.validateOAuthUser(
        'test@test.com',
        'user',
        AuthProvider.GOOGLE,
        '123',
        '',
      )

      expect(usersService.getUserBy).toHaveBeenCalled()
      expect(usersService.createUser).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })
  })

  describe('loginUser', () => {
    it('should set cookie and return access token', async () => {
      const mockRes: Partial<Response> = {
        cookie: jest.fn(),
      }
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        username: 'user',
        password: 'pass',
      }
      ;(jwtService.signAsync as jest.Mock).mockResolvedValue('token123')

      const result = await authService.loginUser(
        mockRes as Response,
        mockUser as User,
      )

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: '1',
        email: 'test@test.com',
        username: 'user',
      })
      expect(mockRes.cookie).toHaveBeenCalledWith('access_token', 'token123', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
      expect(result).toEqual({ access_token: 'token123' })
    })
  })

  describe('registerUser', () => {
    it('should hash password and create new user', async () => {
      const input = {
        username: 'user',
        email: 'test@test.com',
        password: 'pass',
      }
      const createdUser = {
        id: '1',
        username: 'user',
        email: 'test@test.com',
        password: 'hashedPassword',
      }
      ;(usersService.createUser as jest.Mock).mockResolvedValue(createdUser)

      const result = await authService.registerUser(input)
      expect(result).toEqual({
        id: '1',
        username: 'user',
        email: 'test@test.com',
      })
    })
  })
})
