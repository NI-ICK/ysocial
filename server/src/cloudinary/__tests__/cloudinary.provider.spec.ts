import { Test, TestingModule } from '@nestjs/testing'
import { CloudinaryProvider } from '../cloudinary.provider'
import { ConfigOptions } from 'cloudinary'

describe('Cloudinary', () => {
  let cloudinaryConfig: ConfigOptions

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryProvider],
    }).compile()

    cloudinaryConfig = module.get('CLOUDINARY')
  })

  it('should be defined', () => {
    expect(cloudinaryConfig).toBeDefined()
  })
})
