import { Field, ObjectType, registerEnumType } from '@nestjs/graphql'
import { Comment } from 'src/comments/comments.entity'
import { CommentLike } from 'src/comment-likes/comment-likes.entity'
import { Post } from 'src/posts/post.entity'
import { AuthProvider } from 'src/utils/auth-provider.enum'
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { PostLike } from 'src/post-likes/post-likes.entity'
import { Follow } from 'src/follows/follow.entity'

registerEnumType(AuthProvider, { name: 'AuthProvider' })

@Entity()
@ObjectType()
export class User {
  @PrimaryColumn()
  @Field()
  id: string

  @Column({ unique: true })
  @Field()
  username: string

  @Column()
  @Field()
  email: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  password?: string

  @Column({ type: 'enum', enum: AuthProvider })
  @Field(() => AuthProvider)
  provider: AuthProvider

  @Column({ unique: true, nullable: true })
  @Field({ nullable: true })
  providerId?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  imagePath?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  bio?: string

  @OneToMany(() => Post, (post) => post.user, { cascade: true })
  @Field(() => [Post], { nullable: true })
  posts?: Post[]

  @OneToMany(() => Comment, (comment) => comment.user, { cascade: true })
  @Field(() => [Comment], { nullable: true })
  comments?: Comment[]

  @OneToMany(() => CommentLike, (like) => like.user)
  @Field(() => [CommentLike], { nullable: true })
  commentLikes: CommentLike[]

  @OneToMany(() => PostLike, (like) => like.user)
  @Field(() => [PostLike], { nullable: true })
  postLikes: PostLike[]

  @OneToMany(() => Follow, (follow) => follow.follower)
  @Field(() => [Follow], { nullable: true })
  followers: Follow[]

  @OneToMany(() => Follow, (follow) => follow.following)
  @Field(() => [Follow], { nullable: true })
  following: Follow[]
}
