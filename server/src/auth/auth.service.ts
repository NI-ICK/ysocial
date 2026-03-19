import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'
import { RegisterUserInput } from 'src/auth/dtos/register.input'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { User } from 'src/users/user.entity'
import { Response } from 'express'
import { AuthProvider } from 'src/utils/auth-provider.enum'

const DEFAULT_IMAGE_PATH =
  'https://res.cloudinary.com/dzg5ek6qa/image/upload/v1767444425/noPhoto_hwrr7w_x4wghr.webp'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.getUserBy({ email })
    if (!user || user.provider !== AuthProvider.LOCAL)
      throw new UnauthorizedException('Invalid Credentials')

    const isPasswordCorrect = await bcrypt.compare(password, user.password!)
    if (!isPasswordCorrect)
      throw new UnauthorizedException('Invalid Credentials')

    return user
  }

  async validateOAuthUser(
    email: string,
    username: string,
    provider: AuthProvider,
    providerId: string,
    imagePath: string,
  ) {
    const user = await this.usersService.getUserBy({ providerId })
    if (user) return user

    const newUser = await this.usersService.createUser({
      id: randomUUID(),
      username,
      email,
      provider,
      providerId,
      imagePath,
      postLikes: [],
      commentLikes: [],
    })
    return newUser
  }

  async loginUser(res: Response, user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      provider: user.provider,
    }
    const access_token = await this.jwtService.signAsync(payload)

    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    })

    return { access_token }
  }

  async registerUser(registerUserData: RegisterUserInput) {
    const { username, email, password } = registerUserData
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await this.usersService.createUser({
      id: randomUUID(),
      username,
      email,
      password: hashedPassword,
      provider: AuthProvider.LOCAL,
      imagePath: DEFAULT_IMAGE_PATH,
      postLikes: [],
      commentLikes: [],
    })
    const { password: _, ...result } = newUser
    return result
  }
}
