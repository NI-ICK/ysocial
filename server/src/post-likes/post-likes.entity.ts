import { Field, ObjectType } from '@nestjs/graphql'
import { Post } from 'src/posts/post.entity'
import { User } from 'src/users/user.entity'
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm'

@Entity()
@ObjectType()
export class PostLike {
  @PrimaryColumn()
  @Field()
  userId: string

  @PrimaryColumn()
  @Field()
  postId: string

  @ManyToOne(() => User, (user) => user.postLikes, { onDelete: 'CASCADE' })
  @Field(() => User)
  user: User

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  @Field(() => Post)
  post: Post
}
