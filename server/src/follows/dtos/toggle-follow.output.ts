import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ToggleFollowOutput {
  @Field()
  followed: boolean
}
