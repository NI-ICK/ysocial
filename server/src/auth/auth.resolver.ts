import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthService } from './auth.service'
import { RegisterUserInput } from './dtos/register.input'
import { LoginUserResponse } from './dtos/login.output'
import type { Response } from 'express'
import { RegisterUserOutput } from './dtos/register.output'
import { LogoutUserOutput } from './dtos/logout.output'
import { User } from 'src/users/user.entity'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from './guards/gql-auth.guard'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { LoginUserInput } from './dtos/login.input'

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation((_returns) => LoginUserResponse)
  async loginUser(
    @Args('loginUserData') _loginUserData: LoginUserInput,
    @Context() context: { user: User; res: Response },
  ) {
    return this.authService.loginUser(context.res, context.user)
  }

  @Mutation((_returns) => LogoutUserOutput)
  logoutUser(@Context('res') res: Response) {
    res.clearCookie('access_token')
    return { success: true }
  }

  @Mutation((_returns) => RegisterUserOutput)
  registerUser(@Args('registerUserData') registerUserData: RegisterUserInput) {
    return this.authService.registerUser(registerUserData)
  }

  @UseGuards(JwtAuthGuard)
  @Query((_returns) => User)
  getCurrentUser(@CurrentUser() user: User) {
    return user
  }
}
