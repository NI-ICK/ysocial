import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { CreateCommentInput } from './dtos/create-comment.input'
import { CommentsService } from './comments.service'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { DeleteCommentOutput } from './dtos/delete-comment.output'
import { Comment } from './comments.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from 'src/users/user.entity'
import { Post } from 'src/posts/post.entity'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { CommentLikesService } from 'src/comment-likes/comment-likes.service'
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard'
@Resolver(() => Comment)
export class CommentsResolver {
  constructor(
    private commentsService: CommentsService,
    private commentLikesService: CommentLikesService,
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
  ) {}

  @ResolveField(() => [Comment])
  children(@Parent() comment: Comment) {
    return this.commentsRepository
      .createQueryBuilder()
      .relation(Comment, 'children')
      .of(comment)
      .loadMany()
  }

  @ResolveField(() => Post)
  post(@Parent() comment: Comment) {
    return this.commentsRepository
      .createQueryBuilder()
      .relation(Comment, 'post')
      .of(comment)
      .loadOne()
  }

  @ResolveField(() => User)
  user(@Parent() comment: Comment) {
    return this.commentsRepository
      .createQueryBuilder()
      .relation(Comment, 'user')
      .of(comment)
      .loadOne()
  }

  @ResolveField(() => Comment, { nullable: true })
  parent(@Parent() comment: Comment) {
    return this.commentsRepository
      .createQueryBuilder()
      .relation(Comment, 'parent')
      .of(comment)
      .loadOne()
  }

  @ResolveField(() => Number)
  likesCount(@Parent() comment: Comment) {
    return this.commentLikesService.getLikesCountByCommentId(comment.id)
  }

  @ResolveField(() => Boolean)
  likedByMe(@Parent() comment: Comment, @CurrentUser() user?: User | null) {
    if (!user) return false
    return this.commentLikesService.isCommentLikedByUser(comment.id, user.id)
  }

  @ResolveField(() => Number)
  repliesCount(@Parent() comment: Comment) {
    return this.commentsService.getRepliesCountByParentId(comment.id)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((_returns) => Comment)
  async createComment(
    @Args('createCommentData') data: CreateCommentInput,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.createComment(data, user)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((_returns) => DeleteCommentOutput)
  async deleteComment(@Args('id') id: string) {
    await this.commentsService.deleteComment(id)
    return { success: true }
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Query(() => [Comment])
  async getCommentsByPostId(@Args('id') id: string) {
    return await this.commentsService.getCommentsByPostId(id)
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Query(() => [Comment])
  async getRepliesByParentId(@Args('id') id: string) {
    return await this.commentsService.getRepliesByParentId(id)
  }
}
