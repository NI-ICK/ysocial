import { Test, TestingModule } from '@nestjs/testing'
import { PostLikesService } from '../post-likes.service'
import { PostLike } from '../post-likes.entity'
import { In, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Post } from 'src/posts/post.entity'
import { NotFoundException } from '@nestjs/common'
import { User } from 'src/users/user.entity'

describe('PostLikesService', () => {
  let service: PostLikesService
  let postLikesRepository: Partial<Repository<PostLike>>
  let postsRepository: Partial<Repository<Post>>

  const mockLike = {
    postId: '1',
    userId: '2',
  } as PostLike
  const mockUser = {
    id: '2',
    username: 'test',
  } as User
  const mockPost = {
    id: '3',
    body: 'test',
  } as Post

  beforeEach(async () => {
    postLikesRepository = {
      count: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    }
    postsRepository = {
      findOne: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostLikesService,
        {
          provide: getRepositoryToken(PostLike),
          useValue: postLikesRepository,
        },
        {
          provide: getRepositoryToken(Post),
          useValue: postsRepository,
        },
      ],
    }).compile()

    service = module.get<PostLikesService>(PostLikesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getLikesCountBypostId', () => {
    it('should return likes count', async () => {
      ;(postLikesRepository.count as jest.Mock).mockReturnValue(5)

      const result = await service.getLikesCountByPostId('1')

      expect(postLikesRepository.count).toHaveBeenCalledWith({
        where: { postId: '1' },
      })
      expect(result).toEqual(5)
    })
  })

  describe('toggleLike', () => {
    it('should remove like if it already exists', async () => {
      ;(postLikesRepository.findOne as jest.Mock).mockResolvedValue(mockLike)

      const result = await service.toggleLike('1', mockUser)

      expect(postLikesRepository.delete).toHaveBeenCalledWith({
        postId: '1',
        userId: mockUser.id,
      })
      expect(result).toEqual({ addLike: false })
    })

    it('should throw NotFoundException if comment does not exist', async () => {
      ;(postLikesRepository.findOne as jest.Mock).mockResolvedValue(null)
      ;(postsRepository.findOne as jest.Mock).mockResolvedValue(null)

      await expect(service.toggleLike('1', mockUser)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should create like if it does not exist', async () => {
      ;(postLikesRepository.findOne as jest.Mock).mockResolvedValue(null)
      ;(postsRepository.findOne as jest.Mock).mockResolvedValue(mockPost)
      ;(postLikesRepository.create as jest.Mock).mockResolvedValue(mockLike)

      const result = await service.toggleLike('1', mockUser)

      expect(postLikesRepository.save).toHaveBeenCalled()
      expect(result).toEqual({ addLike: true })
    })
  })

  describe('isPostLikedByUser', () => {
    it('should return true if user liked the comment', async () => {
      ;(postLikesRepository.find as jest.Mock).mockResolvedValue([
        { postId: '1', userId: '2' },
        { postId: '2', userId: '2' },
      ])

      const result = await service.isPostLikedByUser('1', '2')

      expect(postLikesRepository.find).toHaveBeenCalledWith({
        where: { postId: In(['1']), userId: '2' },
      })
      expect(result).toEqual(true)
    })

    it('should return false if user has not liked the comment', async () => {
      ;(postLikesRepository.find as jest.Mock).mockResolvedValue([])

      const result = await service.isPostLikedByUser('1', '2')

      expect(postLikesRepository.find).toHaveBeenCalledWith({
        where: { postId: In(['1']), userId: '2' },
      })
      expect(result).toEqual(false)
    })
  })
})
