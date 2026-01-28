import { Test, TestingModule } from '@nestjs/testing'
import { PostsService } from '../posts.service'
import { Post } from '../post.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UsersService } from 'src/users/users.service'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'
import { FileUpload } from 'graphql-upload-ts'
import { CreatePostInput } from '../dtos/create-post.input'
import { BadRequestException, NotFoundException } from '@nestjs/common'

describe('PostsService', () => {
  let postsService: PostsService
  let postsRepository: Partial<Repository<Post>>
  let usersService: Partial<UsersService>
  let cloudinaryService: Partial<CloudinaryService>

  beforeEach(async () => {
    usersService = {
      getUserBy: jest.fn(),
    }
    postsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    }
    cloudinaryService = {
      uploadFile: jest.fn(),
      removeFile: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: postsRepository },
        { provide: UsersService, useValue: usersService },
        { provide: CloudinaryService, useValue: cloudinaryService },
      ],
    }).compile()

    postsService = module.get<PostsService>(PostsService)
  })

  it('should be defined', () => {
    expect(postsService).toBeDefined()
  })

  describe('createPost', () => {
    it('should create post without image', async () => {
      const input = { body: 'test', title: 'test', userId: '1' }
      const mockPost = { id: '1', body: 'test', title: 'test', image: '' }

      ;(usersService.getUserBy as jest.Mock).mockResolvedValue({ id: '1' })
      ;(postsRepository.create as jest.Mock).mockResolvedValue(mockPost)

      const result = await postsService.createPost(input)

      expect(result).toEqual(mockPost)
      expect(usersService.getUserBy).toHaveBeenCalledWith({ id: '1' })
      expect(postsRepository.create).toHaveBeenCalled()
      expect(postsRepository.save).toHaveBeenCalled()
      expect(result.image).toEqual('')
    })

    it('should create post with image', async () => {
      const input = {
        body: 'test',
        title: 'test',
        userId: '1',
        image: Promise.resolve({
          createReadStream: jest.fn(),
        } as Partial<FileUpload>),
      }
      const mockPost = {
        id: '1',
        body: 'test',
        title: 'test',
        image: 'testPath',
        imagePublicId: '123',
      }

      ;(cloudinaryService.uploadFile as jest.Mock).mockResolvedValue({
        secure_url: 'testPath',
        public_id: '123 ',
      })
      ;(usersService.getUserBy as jest.Mock).mockResolvedValue({ id: '1' })
      ;(postsRepository.create as jest.Mock).mockResolvedValue(mockPost)

      const result = await postsService.createPost(input as CreatePostInput)

      expect(result).toEqual(mockPost)
      expect(usersService.getUserBy).toHaveBeenCalledWith({ id: '1' })
      expect(cloudinaryService.uploadFile).toHaveBeenCalled()
      expect(postsRepository.create).toHaveBeenCalled()
      expect(postsRepository.save).toHaveBeenCalled()
      expect(result.image).toEqual('testPath')
      expect(result.imagePublicId).toEqual('123')
    })

    it('should throw BadRequestException if body and image are missing', async () => {
      await expect(postsService.createPost({ userId: '1' })).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw NotFoundException if user is not found', async () => {
      ;(usersService.getUserBy as jest.Mock).mockResolvedValue(null)

      await expect(
        postsService.createPost({ body: 'test', title: 'test', userId: '1' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('editPost', () => {
    it('should edit a post', async () => {
      const mockPost = { body: 'test', title: 'test' }

      ;(postsRepository.findOne as jest.Mock).mockResolvedValue(mockPost)
      ;(postsRepository.save as jest.Mock).mockResolvedValue({
        ...mockPost,
        body: 'new',
      })

      const result = await postsService.editPost({ body: 'new', id: '1' })

      expect(result.body).toEqual('new')
      expect(result.title).toEqual('test')
    })

    it('should throw NotFoundException if post not found', async () => {
      ;(postsRepository.findOne as jest.Mock).mockResolvedValue(null)

      await expect(
        postsService.editPost({ body: 'test', id: '1' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('getPostById', () => {
    it('should return post by id', async () => {
      const mockPost = {
        body: 'test',
        id: '1',
      }
      ;(postsRepository.findOne as jest.Mock).mockResolvedValue(mockPost)

      const result = await postsService.getPostById('1')

      expect(result).toEqual(mockPost)
      expect(postsRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })
  })

  describe('getAllPosts', () => {
    it('should return all posts', async () => {
      const mockPosts = [
        {
          body: 'test',
          id: '1',
        },
        {
          body: 'test2',
          id: '2',
        },
      ]
      ;(postsRepository.find as jest.Mock).mockResolvedValue(mockPosts)

      const result = await postsService.getAllPosts()

      expect(result).toEqual(mockPosts)
      expect(postsRepository.find).toHaveBeenCalled()
    })
  })

  describe('deletePost', () => {
    it('should delete a post without image', async () => {
      const mockPost = { body: 'test', id: '1' }

      ;(postsRepository.findOne as jest.Mock).mockResolvedValue(mockPost)
      ;(postsRepository.delete as jest.Mock).mockResolvedValue(undefined)

      await postsService.deletePost('1')

      expect(postsRepository.delete).toHaveBeenCalledWith('1')
      expect(postsRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })

    it('should delete a post with image', async () => {
      const mockPost = {
        body: 'test',
        id: '1',
        image: 'imagePath',
        imagePublicId: '123',
      }

      ;(postsRepository.findOne as jest.Mock).mockResolvedValue(mockPost)
      ;(postsRepository.delete as jest.Mock).mockResolvedValue(undefined)
      ;(cloudinaryService.removeFile as jest.Mock).mockResolvedValue(undefined)

      await postsService.deletePost('1')

      expect(postsRepository.delete).toHaveBeenCalledWith('1')
      expect(cloudinaryService.removeFile).toHaveBeenCalledWith('123')
      expect(postsRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })

    it('should throw NotFoundException if post not found', async () => {
      ;(postsRepository.findOne as jest.Mock).mockResolvedValue(null)

      await expect(postsService.deletePost('1')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
