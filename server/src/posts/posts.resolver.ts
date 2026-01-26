import { Mutation, Resolver, Query, Args } from '@nestjs/graphql'
import { PostsService } from './posts.service'
import { Post } from './post.entity'
import { CreatePostInput } from './dtos/create-post.input'
import { DeletePostOutput } from './dtos/delete-post.output'
import { EditPostInput } from './dtos/edit-post.input'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'

@Resolver()
export class PostsResolver {
  constructor(private postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation((_return) => Post)
  async createPost(@Args('createPostData') data: CreatePostInput) {
    return await this.postsService.createPost(data)
  }

  @Query((_return) => Post)
  getPostById(@Args('id') id: string) {
    return this.postsService.getPostById(id)
  }

  @Query((_return) => [Post])
  getAllPosts() {
    return this.postsService.getAllPosts()
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
}
