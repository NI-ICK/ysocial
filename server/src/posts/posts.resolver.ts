import { Mutation, Resolver, Query, Args, Int } from '@nestjs/graphql'
import { PostsService } from './posts.service'
import { Post } from './post.entity'
import { CreatePostInput } from './dtos/create-post.input'
import { DeletePostOutput } from './dtos/delete-post.output'
import { EditPostInput } from './dtos/edit-post.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { Parent, ResolveField } from '@nestjs/graphql'
import { User } from 'src/users/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CurrentUser } from 'src/auth/decorators/current-user.decorator'
import { PostLikesService } from 'src/post-likes/post-likes.service'
import { CommentsService } from 'src/comments/comments.service'
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard'

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private postsService: PostsService,
    private commentsService: CommentsService,
    private postLikesService: PostLikesService,
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}

  @ResolveField(() => User)
  user(@Parent() post: Post) {
    return this.postsRepository
      .createQueryBuilder()
      .relation(Post, 'user')
      .of(post)
      .loadOne()
  }

  @ResolveField(() => [Comment])
  comments(@Parent() post: Post) {
    return this.commentsService.getCommentsByPostId(post.id)
  }

  @ResolveField(() => Number)
  likesCount(@Parent() post: Post) {
    return this.postLikesService.getLikesCountByPostId(post.id)
  }

  @ResolveField(() => Boolean)
  likedByMe(@Parent() post: Post, @CurrentUser() user?: User | null) {
    if (!user) return false
    return this.postLikesService.isPostLikedByUser(post.id, user.id)
  }

  @ResolveField(() => Number)
  commentsCount(@Parent() post: Post) {
    return this.commentsService.getCommentsCountByPostId(post.id)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((_return) => Post)
  async createPost(
    @Args('createPostData') data: CreatePostInput,
    @CurrentUser() user: User,
  ) {
    return await this.postsService.createPost(data, user)
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Query((_return) => Post)
  getPostById(@Args('id') id: string) {
    return this.postsService.getPostById(id)
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Query((_return) => [Post])
  getPosts(
    @Args('limit', { type: () => Int }) limit: number,
    @Args('offset', { type: () => Int }) offset: number,
  ) {
    return this.postsService.getPosts(limit, offset)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((_return) => Post)
  async editPost(@Args('editPostData') data: EditPostInput) {
    return await this.postsService.editPost(data)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation((_returns) => DeletePostOutput)
  async deletePost(@Args('id') id: string) {
    await this.postsService.deletePost(id)
    return { success: true, message: 'Post deleted' }
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Query(() => [Post])
  async getPostsCreatedByUser(
    @Args('userId') userId: string,
    @Args('limit', { type: () => Int }) limit: number,
    @Args('offset', { type: () => Int }) offset: number,
  ) {
    return await this.postsService.getPostsCreatedByUser(userId, limit, offset)
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Query(() => [Post])
  async getPostsLikedByUser(
    @Args('userId') userId: string,
    @Args('limit', { type: () => Int }) limit: number,
    @Args('offset', { type: () => Int }) offset: number,
  ) {
    return await this.postLikesService.getPostsLikedByUser(
      userId,
      limit,
      offset,
    )
  }
}
