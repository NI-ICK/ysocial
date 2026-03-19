import { Field, ObjectType } from '@nestjs/graphql'
import { Comment } from 'src/comments/comments.entity'
import { User } from 'src/users/user.entity'
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm'

@Entity()
@ObjectType()
export class CommentLike {
  @PrimaryColumn()
  @Field()
  userId: string

  @PrimaryColumn()
  @Field()
  commentId: string

  @ManyToOne(() => User, (user) => user.commentLikes, { onDelete: 'CASCADE' })
  @Field(() => User)
  user: User

  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' })
  @Field(() => Comment)
  comment: Comment
}
