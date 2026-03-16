import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class DeleteCommentOutput {
  @Field()
  success: boolean
}
