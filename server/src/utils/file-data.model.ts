import { Field, InputType } from '@nestjs/graphql'
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts'

@InputType()
export class FileDataModel {
  @Field(() => GraphQLUpload)
  file: Promise<FileUpload>
}
