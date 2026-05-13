import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersResolver } from './users.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './user.entity'
import { FollowsModule } from 'src/follows/follows.module'

@Module({
  imports: [TypeOrmModule.forFeature([User]), FollowsModule],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
