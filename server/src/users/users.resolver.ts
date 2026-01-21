import { Query, Resolver } from '@nestjs/graphql'
import { User } from './user.entity'
import { UsersService } from './users.service'

@Resolver()
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query((_returns) => [User])
  getAllUsers() {
    return this.usersService.getAllUsers()
  }
}
