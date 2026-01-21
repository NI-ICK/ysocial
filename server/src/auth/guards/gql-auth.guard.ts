import { ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'

interface LoginUserArgs {
  loginUserData: {
    email: string
    password: string
  }
}

@Injectable()
export class GqlAuthGuard extends AuthGuard('local') {
  constructor() {
    super()
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    const request: Request = ctx.getContext()
    request.body = ctx.getArgs<LoginUserArgs>().loginUserData
    return request
  }
}
