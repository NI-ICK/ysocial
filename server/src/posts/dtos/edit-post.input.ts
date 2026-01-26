import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class EditPostInput {
  @Field()
  id: string

  @Field({ nullable: true })
  title?: string

  @Field({ nullable: true })
  body?: string
}
