import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class LogoutUserOutput {
  @Field()
  success: boolean
}
