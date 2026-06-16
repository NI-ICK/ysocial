import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { User } from './user.entity'
import { UsersService } from './users.service'
import { FollowsService } from 'src/follows/follows.service'
import {
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { DeleteUserOutput } from './dtos/delete-user.output'
import { UpdateUserInput } from './dtos/update-user.input'
import { UpdateUserProfileImageInput } from './dtos/update-user-profile-image.input'

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
  followedByMe(@Parent() user: User, @CurrentUser() currentUser: User | null) {
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

  @Query(() => Boolean)
  async isUsernameTaken(@Args('username') username: string) {
    return this.usersService.isUsernameTaken(username)
  }

  @Query(() => Boolean)
  async isEmailTaken(@Args('email') email: string) {
    return this.usersService.isEmailTaken(email)
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Mutation(() => User)
  async updateUser(
    @Args('data') data: UpdateUserInput,
    @CurrentUser() user: User | null,
  ) {
    if (!user) throw new UnauthorizedException('You are not logged in')

    return await this.usersService.updateUser(data, user.id)
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Mutation(() => DeleteUserOutput)
  async deleteUser(@CurrentUser() user: User | null) {
    if (!user) throw new UnauthorizedException('You are not logged in')

    await this.usersService.deleteUser(user.id)

    return { success: true, message: 'User deleted' }
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Mutation(() => User)
  async updateUserProfileImage(
    @Args('data') data: UpdateUserProfileImageInput,
    @CurrentUser() user: User | null,
  ) {
    if (!user) throw new UnauthorizedException('You are not logged in')

    return await this.usersService.updateUserProfileImage(data, user.id)
  }
}
