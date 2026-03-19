import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { User } from 'src/users/user.entity'
import { CommentLikesService } from './comment-likes.service'
import { ToggleLikeOutput } from 'src/post-likes/dtos/toggle-like.output'

@Resolver()
export class CommentLikesResolver {
  constructor(private commentLikesService: CommentLikesService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation((_returns) => ToggleLikeOutput)
  toggleCommentLike(
    @Args('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    return this.commentLikesService.toggleLike(commentId, user)
  }
}
