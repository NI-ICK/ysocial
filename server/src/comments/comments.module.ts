import { Module } from '@nestjs/common'
import { Comment } from './comments.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommentsService } from './comments.service'
import { CommentsResolver } from './comments.resolver'
import { UsersModule } from 'src/users/users.module'
import { Post } from 'src/posts/post.entity'
import { CommentLikesModule } from 'src/comment-likes/comment-likes.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post]),
    UsersModule,
    CommentLikesModule,
  ],
  providers: [CommentsService, CommentsResolver],
  exports: [CommentsService],
})
export class CommentsModule {}
