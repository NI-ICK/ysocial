import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { GoogleAuthGuard } from './guards/google-auth.guard'
import type { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { User } from 'src/users/user.entity'
import { GithubAuthGuard } from './guards/github-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    if (!req.user)
      throw new UnauthorizedException('Google Authentication Failed')
    await this.authService.loginUser(res, req.user as User)
    return res.redirect(process.env.FRONTEND_URL!)
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  githubAuth() {}

  @Get('github/redirect')
  @UseGuards(GithubAuthGuard)
  async githubAuthRedirect(@Req() req: Request, @Res() res: Response) {
    if (!req.user)
      throw new UnauthorizedException('Github Authentication Failed')
    await this.authService.loginUser(res, req.user as User)
    return res.redirect(process.env.FRONTEND_URL!)
  }
}
