import { Field, InputType } from '@nestjs/graphql'
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts'

@InputType()
export class CreatePostInput {
  @Field({ nullable: true })
  body?: string

  @Field(() => GraphQLUpload, { nullable: true })
  image?: Promise<FileUpload>

  @Field()
  userId: string
}
