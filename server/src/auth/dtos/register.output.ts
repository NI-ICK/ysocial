import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class RegisterUserOutput {
  @Field()
  id: string

  @Field()
  username: string

  @Field()
  email: string
}
