import { Module } from '@nestjs/common'
import { FollowsService } from './follows.service'
import { FollowsResolver } from './follows.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Follow } from './follow.entity'
import { User } from 'src/users/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Follow, User])],
  providers: [FollowsService, FollowsResolver],
  exports: [FollowsService],
})
export class FollowsModule {}
