import { Field, ObjectType } from '@nestjs/graphql'
import { User } from 'src/users/user.entity'
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'

@Entity()
@ObjectType()
export class Post {
  @PrimaryColumn()
  @Field()
  id: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  body?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  image?: string

  @Column({ nullable: true })
  @Field({ nullable: true })
  imagePublicId?: string

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @Field(() => User)
  user: User
}
