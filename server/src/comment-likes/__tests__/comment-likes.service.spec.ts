import { Test, TestingModule } from '@nestjs/testing'
import { CommentLikesService } from '../comment-likes.service'
import { In, Repository } from 'typeorm'
import { CommentLike } from '../comment-likes.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Comment } from 'src/comments/comments.entity'
import { User } from 'src/users/user.entity'
import { NotFoundException } from '@nestjs/common'

describe('LikesService', () => {
  let service: CommentLikesService
  let commentLikesRepository: Partial<Repository<CommentLike>>
  let commentsRepository: Partial<Repository<Comment>>

  const mockLike = {
    commentId: '1',
    userId: '2',
  } as CommentLike
  const mockUser = {
    id: '2',
    username: 'test',
  } as User
  const mockComment = {
    id: '3',
    body: 'test',
  } as Comment

  beforeEach(async () => {
    commentLikesRepository = {
      count: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    }
    commentsRepository = {
      findOne: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentLikesService,
        {
          provide: getRepositoryToken(CommentLike),
          useValue: commentLikesRepository,
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: commentsRepository,
        },
      ],
    }).compile()

    service = module.get<CommentLikesService>(CommentLikesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getLikesCountByCommentId', () => {
    it('should return likes count', async () => {
      ;(commentLikesRepository.count as jest.Mock).mockReturnValue(5)

      const result = await service.getLikesCountByCommentId('1')

      expect(commentLikesRepository.count).toHaveBeenCalledWith({
        where: { commentId: '1' },
      })
      expect(result).toEqual(5)
    })
  })

  describe('toggleLike', () => {
    it('should remove like if it already exists', async () => {
      ;(commentLikesRepository.findOne as jest.Mock).mockResolvedValue(mockLike)

      const result = await service.toggleLike('1', mockUser)

      expect(commentLikesRepository.delete).toHaveBeenCalledWith({
        commentId: '1',
        userId: mockUser.id,
      })
      expect(result).toEqual({ addLike: false })
    })

    it('should throw NotFoundException if comment does not exist', async () => {
      ;(commentLikesRepository.findOne as jest.Mock).mockResolvedValue(null)
      ;(commentsRepository.findOne as jest.Mock).mockResolvedValue(null)

      await expect(service.toggleLike('1', mockUser)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should create like if it does not exist', async () => {
      ;(commentLikesRepository.findOne as jest.Mock).mockResolvedValue(null)
      ;(commentsRepository.findOne as jest.Mock).mockResolvedValue(mockComment)
      ;(commentLikesRepository.create as jest.Mock).mockResolvedValue(mockLike)

      const result = await service.toggleLike('1', mockUser)

      expect(commentLikesRepository.save).toHaveBeenCalled()
      expect(result).toEqual({ addLike: true })
    })
  })

  describe('isCommentLikedByUser', () => {
    it('should return true if user liked the comment', async () => {
      ;(commentLikesRepository.find as jest.Mock).mockResolvedValue([
        { commentId: '1', userId: '2' },
        { commentId: '2', userId: '2' },
      ])

      const result = await service.isCommentLikedByUser('1', '2')

      expect(commentLikesRepository.find).toHaveBeenCalledWith({
        where: { commentId: In(['1']), userId: '2' },
      })
      expect(result).toEqual(true)
    })

    it('should return false if user has not liked the comment', async () => {
      ;(commentLikesRepository.find as jest.Mock).mockResolvedValue([])

      const result = await service.isCommentLikedByUser('1', '2')

      expect(commentLikesRepository.find).toHaveBeenCalledWith({
        where: { commentId: In(['1']), userId: '2' },
      })
      expect(result).toEqual(false)
    })
  })
})
