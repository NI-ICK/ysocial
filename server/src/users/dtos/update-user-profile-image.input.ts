import { Field, InputType } from '@nestjs/graphql'
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts'

@InputType()
export class UpdateUserProfileImageInput {
  @Field(() => GraphQLUpload)
  image: Promise<FileUpload>
}
