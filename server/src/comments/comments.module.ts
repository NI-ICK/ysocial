import { Module } from '@nestjs/common'
import { Comment } from './comments.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CommentsService } from './comments.service'
import { CommentsResolver } from './comments.resolver'
import { UsersModule } from 'src/users/users.module'
import { PostsModule } from 'src/posts/posts.module'

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), UsersModule, PostsModule],
  providers: [CommentsService, CommentsResolver],
})
export class CommentsModule {}
