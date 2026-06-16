import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  newPassword?: string

  @Field({ nullable: true })
  newEmail?: string

  @Field({ nullable: true })
  newUsername?: string

  @Field({ nullable: true })
  newBio?: string
}
