import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
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

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(
    private commentsService: CommentsService,
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
  ) {}

  @ResolveField(() => User)
  user(@Parent() comment: Comment) {
    return this.commentsRepository
      .createQueryBuilder()
      .relation(Comment, 'user')
      .of(comment)
      .loadOne()
  }

  @ResolveField(() => Comment)
  parent(@Parent() parent: Comment) {
    return this.commentsRepository
      .createQueryBuilder()
      .relation(Comment, 'parent')
      .of(parent)
      .loadOne()
  }

  @ResolveField(() => Comment)
  children(@Parent() children: Comment) {
    return this.commentsRepository
      .createQueryBuilder()
      .relation(Comment, 'children')
      .of(children)
      .loadOne()
  }

  @ResolveField(() => Post)
  post(@Parent() post: Post) {
    return this.commentsRepository
      .createQueryBuilder()
      .relation(Post, 'post')
      .of(post)
      .loadOne()
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((_returns) => Comment)
  async createComment(@Args('createCommentData') data: CreateCommentInput) {
    return this.commentsService.createComment(data)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((_returns) => DeleteCommentOutput)
  async deleteComment(@Args('id') id: string) {
    await this.commentsService.deleteComment(id)
    return { success: true }
  }
}
