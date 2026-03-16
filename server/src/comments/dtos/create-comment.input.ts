import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class CreateCommentInput {
  @Field()
  body: string

  @Field()
  userId: string

  @Field()
  postId: string

  @Field(() => String, { nullable: true })
  parentId?: string | null
}
