import { Module } from '@nestjs/common'
import { PostLikesResolver } from './post-likes.resolver'
import { PostLikesService } from './post-likes.service'
import { PostLike } from './post-likes.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Post } from 'src/posts/post.entity'

@Module({
  imports: [TypeOrmModule.forFeature([PostLike, Post])],
  providers: [PostLikesResolver, PostLikesService],
  exports: [PostLikesService],
})
export class PostLikesModule {}
