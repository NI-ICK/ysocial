import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { User } from './user.entity'
import { UsersService } from './users.service'
import { FollowsService } from 'src/follows/follows.service'
import { NotFoundException, UseGuards } from '@nestjs/common'
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private followsService: FollowsService,
  ) {}

  @ResolveField(() => Number)
  followersCount(@Parent() user: User) {
    return this.followsService.getFollowersCountOfUser(user.id)
  }

  @ResolveField(() => Number)
  followingCount(@Parent() user: User) {
    return this.followsService.getFollowingCountOfUser(user.id)
  }

  @ResolveField(() => Boolean)
  followedByMe(@Parent() user: User, @CurrentUser() currentUser?: User | null) {
    if (!currentUser) return false
    return this.followsService.getFollowedByMe(currentUser.id, user.id)
  }

  @Query((_returns) => [User])
  getAllUsers() {
    return this.usersService.getAllUsers()
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Query(() => User)
  async getUserByUsername(@Args('username') username: string) {
    const user = await this.usersService.getUserBy({ username })
    if (!user) throw new NotFoundException('User not found')

    return user
  }
}
