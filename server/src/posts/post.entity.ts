import { Field, ObjectType } from '@nestjs/graphql'
import { User } from 'src/users/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
@ObjectType()
export class Post {
  @PrimaryColumn()
  @Field()
  id: string

  @CreateDateColumn({ type: 'timestamptz' })
  @Field()
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  @Field()
  updatedAt: Date

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
