import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy } from 'passport-jwt'
import { UsersService } from 'src/users/users.service'
import { AuthProvider } from 'src/utils/auth-provider.enum'

interface JwtPayload {
  email: string
  provider: AuthProvider
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        return req.cookies.access_token as string
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET')!,
    })
  }

  async validate(payload: JwtPayload) {
    const { email, provider } = payload
    const user = await this.usersService.getUserBy({
      email,
      provider,
    })
    if (!user) throw new UnauthorizedException('Invalid Credentials')

    return user
  }
}
