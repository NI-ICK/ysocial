import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { FollowsService } from './follows.service'
import { User } from 'src/users/user.entity'
import { ToggleFollowOutput } from './dtos/toggle-follow.output'
import { UseGuards } from '@nestjs/common'
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'

@Resolver()
export class FollowsResolver {
  constructor(private followsService: FollowsService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Mutation(() => ToggleFollowOutput)
  toggleFollow(
    @Args('userId') userId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.followsService.toggleFollow(currentUser.id, userId)
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Query(() => [User])
  getFollowersOfUser(
    @Args('username') username: string,
    @Args('limit', { type: () => Int }) limit: number,
    @Args('offset', { type: () => Int }) offset: number,
  ) {
    return this.followsService.getFollowersOfUser(username, limit, offset)
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Query(() => [User])
  getFollowingOfUser(
    @Args('username') username: string,
    @Args('limit', { type: () => Int }) limit: number,
    @Args('offset', { type: () => Int }) offset: number,
  ) {
    return this.followsService.getFollowingOfUser(username, limit, offset)
  }
}
