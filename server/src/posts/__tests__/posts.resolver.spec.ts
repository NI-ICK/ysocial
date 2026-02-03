import { Test, TestingModule } from '@nestjs/testing'
import { PostsResolver } from '../posts.resolver'
import { PostsService } from '../posts.service'
import { Post } from '../post.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

describe('PostsResolver', () => {
  let resolver: PostsResolver
  let service: Partial<PostsService>
  let postsRepository: Partial<Repository<Post>>

  beforeEach(async () => {
    service = {
      createPost: jest.fn(),
      editPost: jest.fn(),
      getPostById: jest.fn(),
      getAllPosts: jest.fn(),
      deletePost: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsResolver,
        { provide: PostsService, useValue: service },
        { provide: getRepositoryToken(Post), useValue: postsRepository },
      ],
    }).compile()

    resolver = module.get<PostsResolver>(PostsResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('createPost', () => {
    it('should call postsService.createPost and return the result', async () => {
      const input = { body: 'test', userId: '1' }
      const mockPost = { id: '1', ...input }

      ;(service.createPost as jest.Mock).mockResolvedValue(mockPost)

      const result = await resolver.createPost(input)
      expect(result).toEqual(mockPost)
    })
  })

  describe('editPost', () => {
    it('should call postsService.editPost and return the result', async () => {
      const input = { body: 'test2', id: '1' }
      const mockPost = { body: 'test1', id: '1' } as Post

      ;(service.editPost as jest.Mock).mockResolvedValue(mockPost)

      const result = await resolver.editPost(input)
      expect(result).toEqual(mockPost)
    })
  })

  describe('getPostById', () => {
    it('should call postsService.getPostById and return the result', async () => {
      const mockPost = { body: 'test', id: '1' }

      ;(service.getPostById as jest.Mock).mockResolvedValue(mockPost)

      const result = await resolver.getPostById('1')
      expect(result).toEqual(mockPost)
      expect(service.getPostById).toHaveBeenCalledWith('1')
    })
  })

  describe('getAllPosts', () => {
    it('should call postsService.getAllPosts and return the result', async () => {
      const mockPosts = [
        { body: 'test', id: '1' },
        { body: 'test2', id: '2' },
      ]

      ;(service.getAllPosts as jest.Mock).mockResolvedValue(mockPosts)

      const result = await resolver.getAllPosts()
      expect(result).toEqual(mockPosts)
      expect(service.getAllPosts).toHaveBeenCalled()
    })
  })

  describe('deletePost', () => {
    it('should call postsService.deletePost and return the result', async () => {
      ;(service.deletePost as jest.Mock).mockResolvedValue(undefined)

      const result = await resolver.deletePost('1')
      expect(result).toEqual({ success: true, message: 'Post deleted' })
      expect(service.deletePost).toHaveBeenCalledWith('1')
    })
  })
})
