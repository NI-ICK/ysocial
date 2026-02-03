import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class EditPostInput {
  @Field()
  id: string

  @Field()
  body: string
}
