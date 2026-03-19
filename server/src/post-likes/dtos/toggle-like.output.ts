import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ToggleLikeOutput {
  @Field()
  addLike: boolean
}
