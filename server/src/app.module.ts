import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './users/user.entity'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { CloudinaryModule } from './cloudinary/cloudinary.module'
import { graphqlUploadExpress } from 'graphql-upload-ts'
import { Post } from './posts/post.entity'
import { PostsModule } from './posts/posts.module'
import { CommentsModule } from './comments/comments.module'
import { Comment } from './comments/comments.entity'
import { CommentLikesModule } from './comment-likes/comment-likes.module'
import { PostLikesModule } from './post-likes/post-likes.module'
import { PostLike } from './post-likes/post-likes.entity'
import { CommentLike } from './comment-likes/comment-likes.entity'
import { FollowsModule } from './follows/follows.module'
import { Follow } from './follows/follow.entity'

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      driver: ApolloDriver,
      autoSchemaFile: 'src/schema.gql',
      graphiql: true,
      playground: {
        settings: { 'request.credentials': 'include' },
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Post, Comment, PostLike, CommentLike, Follow],
      synchronize: process.env.TYPEORM_SYNC as boolean | undefined,
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    CloudinaryModule,
    CommentLikesModule,
    PostLikesModule,
    FollowsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        graphqlUploadExpress({
          maxFileSize: 1024 * 1024 * 10, // 10MB
          maxFiles: 1,
        }),
      )
      .forRoutes('graphql')
  }
}
