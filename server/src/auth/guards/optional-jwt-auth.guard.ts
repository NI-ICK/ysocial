import { ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { User } from 'src/users/user.entity'

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext<{ req: Request }>().req
  }

  handleRequest<TUser = User>(
    err: unknown,
    user: TUser | false | null,
  ): TUser | null {
    if (err) return null

    return (user as TUser) ?? null
  }
}
