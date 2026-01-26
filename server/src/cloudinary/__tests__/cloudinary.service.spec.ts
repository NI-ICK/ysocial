import { Test, TestingModule } from '@nestjs/testing'
import { CloudinaryService } from '../cloudinary.service'
import { Readable, Writable } from 'stream'
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary'
import { FileUpload } from 'graphql-upload-ts'

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}))

const mockFile = (overrides = {}) => ({
  mimetype: 'image/jpeg',
  createReadStream: () => Readable.from(['test-file-content']),
  ...overrides,
})

describe('CloudinaryService', () => {
  let service: CloudinaryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile()

    service = module.get<CloudinaryService>(CloudinaryService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const file = mockFile()

      ;(cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (
          options,
          callback: (
            error: UploadApiErrorResponse | null,
            result: UploadApiResponse | null,
          ) => void,
        ) => {
          const writable = new Writable({
            write() {
              callback(null, {
                secure_url: 'http://test',
                public_id: '123',
              } as UploadApiResponse)
            },
          })
          return writable
        },
      )

      const result = await service.uploadFile(file as FileUpload, 'folder')

      expect(result.secure_url).toBe('http://test')
      expect(result.public_id).toBe('123')
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalled()
    })

    it('should throw BadRequestException on invalid mimetype', () => {
      const file = mockFile({ mimetype: 'test' })

      expect(() => service.uploadFile(file as FileUpload, 'folder')).toThrow(
        'Invalid file type',
      )
    })

    it('should reject when cloudinary returns empty response', async () => {
      const file = mockFile()

      ;(cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (
          options,
          callback: (
            error: UploadApiErrorResponse | null,
            result: UploadApiResponse | null,
          ) => void,
        ) => {
          const writable = new Writable({
            write() {
              callback(null, null)
            },
          })
          return writable
        },
      )

      await expect(
        service.uploadFile(file as FileUpload, 'folder'),
      ).rejects.toThrow('Cloudinary Upload Failed: empty response')
    })
  })

  describe('removeFile', () => {
    it('should remove file successfully', async () => {
      ;(cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: 'ok',
      })

      await expect(service.removeFile('123')).resolves.not.toThrow()
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('123')
    })

    it('should remove file successfully', async () => {
      ;(cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: 'error',
      })

      await expect(service.removeFile('123')).rejects.toThrow(
        'Failed to remove file',
      )
    })
  })
})
