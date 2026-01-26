import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryResponse } from './cloudinary-response'
import { FileUpload } from 'graphql-upload-ts'

@Injectable()
export class CloudinaryService {
  uploadFile(file: FileUpload, folder: string): Promise<CloudinaryResponse> {
    const stream = file.createReadStream()

    const allowedTypes = ['image/webp', 'image/png', 'image/jpeg']
    if (!allowedTypes.includes(file.mimetype))
      throw new BadRequestException('Invalid file type')

    return new Promise<CloudinaryResponse>((resolve, rejects) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return rejects(new Error(error.message))
          if (!result)
            return rejects(
              new Error('Cloudinary Upload Failed: empty response'),
            )
          resolve(result as CloudinaryResponse)
        },
      )
      stream.pipe(uploadStream)
    })
  }

  async removeFile(id: string) {
    await cloudinary.uploader.destroy(id).then((result: { result: string }) => {
      if (result.result !== 'ok') {
        throw new InternalServerErrorException('Failed to remove file')
      }
    })
  }
}
