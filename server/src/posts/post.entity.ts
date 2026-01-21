import { Field, ObjectType } from '@nestjs/graphql'
import { User } from 'src/users/user.entity'
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm'

@Entity()
@ObjectType()
export class Post {
  @PrimaryColumn()
  @Field()
  id: string

  @Field()
  title: string

  @Field()
  body: string

  @Field()
  image?: string

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  user: User
}
