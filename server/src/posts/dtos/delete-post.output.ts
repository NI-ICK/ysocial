import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class DeletePostOutput {
  @Field()
  success: boolean

  @Field()
  message: string
}
