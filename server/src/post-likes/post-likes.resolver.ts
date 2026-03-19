import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { PostLikesService } from './post-likes.service'
import { User } from 'src/users/user.entity'
import { ToggleLikeOutput } from './dtos/toggle-like.output'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'

@Resolver()
export class PostLikesResolver {
  constructor(private postLikesService: PostLikesService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation((_returns) => ToggleLikeOutput)
  togglePostLike(@Args('postId') postId: string, @CurrentUser() user: User) {
    return this.postLikesService.toggleLike(postId, user)
  }
}
