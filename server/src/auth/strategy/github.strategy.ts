/* eslint-disable */

import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from '../auth.service'
import { Strategy, Profile } from 'passport-github2'
import { AuthProvider } from 'src/utils/auth-provider.enum'

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'],
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = await this.authService.validateOAuthUser(
      profile.emails?.[0].value || '',
      profile.displayName,
      AuthProvider.GITHUB,
      profile.id,
      profile.photos?.[0].value || '',
    )
    return user
  }
}
