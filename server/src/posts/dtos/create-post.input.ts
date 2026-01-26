import { Field, InputType } from '@nestjs/graphql'
import { FileDataModel } from 'src/utils/file-data.model'

@InputType()
export class CreatePostInput {
  @Field()
  title: string

  @Field()
  body: string

  @Field({ nullable: true })
  image?: FileDataModel

  @Field()
  userId: string
}
