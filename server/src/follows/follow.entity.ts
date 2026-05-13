import { Field, ObjectType } from '@nestjs/graphql'
import { User } from 'src/users/user.entity'
import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm'

@ObjectType()
@Entity()
@Index(['follower', 'following'], { unique: true })
export class Follow {
  @PrimaryColumn()
  followerId: string

  @PrimaryColumn()
  followingId: string

  @CreateDateColumn({ type: 'timestamptz' })
  @Field()
  createdAt: Date

  @ManyToOne(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  @Field(() => User)
  follower: User

  @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  @Field(() => User)
  following: User
}
