import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './users/user.entity'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'

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
      entities: [User],
      synchronize: process.env.TYPEORM_SYNC as boolean | undefined,
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
