import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '../auth.controller'
import { AuthService } from '../auth.service'
import { Request, Response } from 'express'
import { UnauthorizedException } from '@nestjs/common'

describe('AuthController', () => {
  let authController: AuthController
  let authService: Partial<AuthService>
  const res = { redirect: jest.fn() } as Partial<Response>

  beforeEach(async () => {
    authService = {
      loginUser: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile()

    authController = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(authController).toBeDefined()
    expect(authService).toBeDefined()
  })

  describe('googleAuth', () => {
    it('should be defined', () => {
      expect(authController.googleAuth.bind(authController)).toBeDefined()
    })
  })

  describe('googleAuthRedirect', () => {
    it('should call authService.loginUser and redirect', async () => {
      const req = {
        user: { id: '1', email: 'test@test.com' },
      } as Partial<Request>
      ;(authService.loginUser as jest.Mock).mockResolvedValue({
        access_token: '123',
      })

      await authController.googleAuthRedirect(req as Request, res as Response)

      expect(authService.loginUser).toHaveBeenCalledWith(res, {
        id: '1',
        email: 'test@test.com',
      })
      expect(res.redirect).toHaveBeenCalledWith(process.env.FRONTEND_URL)
    })

    it('should throw UnauthorizedException if req.user is missing', async () => {
      const req = {
        user: undefined,
      } as Partial<Request>

      await expect(
        authController.googleAuthRedirect(req as Request, res as Response),
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('githubAuth', () => {
    it('should be defined', () => {
      expect(authController.githubAuth.bind(authController)).toBeDefined()
    })
  })

  describe('githubAuthRedirect', () => {
    it('should call authService.loginUser and redirect', async () => {
      const req = {
        user: { id: '1', email: 'test@test.com' },
      } as Partial<Request>
      ;(authService.loginUser as jest.Mock).mockResolvedValue({
        access_token: '123',
      })

      await authController.githubAuthRedirect(req as Request, res as Response)

      expect(authService.loginUser).toHaveBeenCalledWith(res, {
        id: '1',
        email: 'test@test.com',
      })
      expect(res.redirect).toHaveBeenCalledWith(process.env.FRONTEND_URL)
    })

    it('should throw UnauthorizedException if req.user is missing', async () => {
      const req = {
        user: undefined,
      } as Partial<Request>

      await expect(
        authController.githubAuthRedirect(req as Request, res as Response),
      ).rejects.toThrow(UnauthorizedException)
    })
  })
})
