import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-google-oauth20'
import { AuthService } from '../auth.service'
import { AuthProvider } from 'src/utils/auth-provider.enum'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['profile', 'email'],
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = await this.authService.validateOAuthUser(
      profile.emails?.[0].value || '',
      profile.displayName,
      AuthProvider.GOOGLE,
      profile.id,
      profile.photos?.[0].value || '',
    )
    return user
  }
}
