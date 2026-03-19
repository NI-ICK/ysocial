import { Module } from '@nestjs/common'
import { CommentLikesService } from './comment-likes.service'
import { CommentLikesResolver } from './comment-likes.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommentLike } from './comment-likes.entity'
import { Comment } from 'src/comments/comments.entity'

@Module({
  imports: [TypeOrmModule.forFeature([CommentLike, Comment])],
  providers: [CommentLikesService, CommentLikesResolver],
  exports: [CommentLikesService],
})
export class CommentLikesModule {}
