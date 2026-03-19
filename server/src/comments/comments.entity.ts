import { Field, ObjectType } from '@nestjs/graphql'
import { CommentLike } from 'src/comment-likes/comment-likes.entity'
import { Post } from 'src/posts/post.entity'
import { User } from 'src/users/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
@ObjectType()
export class Comment {
  @PrimaryColumn()
  @Field()
  id: string

  @CreateDateColumn({ type: 'timestamptz' })
  @Field()
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  @Field()
  updatedAt: Date

  @Column()
  @Field()
  body: string

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  @Field(() => User)
  user: User

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  @Field(() => Post)
  post: Post

  @ManyToOne(() => Comment, (comment) => comment.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @Field(() => Comment, { nullable: true })
  parent?: Comment | null

  @OneToMany(() => Comment, (comment) => comment.parent)
  @Field(() => [Comment], { nullable: true })
  children?: Comment[]

  @OneToMany(() => CommentLike, (like) => like.comment)
  @Field(() => [CommentLike])
  likes: CommentLike[]
}
