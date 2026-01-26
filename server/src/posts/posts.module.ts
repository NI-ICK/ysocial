import { Module } from '@nestjs/common'
import { PostsResolver } from './posts.resolver'
import { Post } from './post.entity'
import { PostsService } from './posts.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from 'src/users/users.module'
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module'

@Module({
  imports: [TypeOrmModule.forFeature([Post]), UsersModule, CloudinaryModule],
  providers: [PostsService, PostsResolver],
  exports: [PostsService],
})
export class PostsModule {}
