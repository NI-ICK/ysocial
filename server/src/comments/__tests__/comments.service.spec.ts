import { Test, TestingModule } from '@nestjs/testing'
import { CommentsService } from '../comments.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Comment } from '../comments.entity'
import { Repository } from 'typeorm'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { User } from 'src/users/user.entity'
import { Post } from 'src/posts/post.entity'

describe('CommentsService', () => {
  let service: CommentsService
  let commentsRepository: Partial<Repository<Comment>>
  let postsRepository: Partial<Repository<Post>>

  const mockUser = {
    id: '1',
    username: 'test',
  } as User
  const mockComment = {
    id: '1',
    body: 'test',
    user: mockUser,
    parent: null,
  }
  const parentMock = { id: '3', body: 'test' }
  const postMock = {
    id: '2',
    body: 'test',
  }

  beforeEach(async () => {
    commentsRepository = {
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
        CommentsService,
        { provide: getRepositoryToken(Comment), useValue: commentsRepository },
        { provide: getRepositoryToken(Post), useValue: postsRepository },
      ],
    }).compile()

    service = module.get<CommentsService>(CommentsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createComment', () => {
    it('should throw BadRequestException if body is null', async () => {
      await expect(
        service.createComment(
          {
            body: '',
            postId: '2',
          },
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw NotFoundException if parent is null', async () => {
      ;(commentsRepository.findOne as jest.Mock).mockResolvedValue(null)

      await expect(
        service.createComment(
          {
            body: 'test',
            postId: '2',
            parentId: '3',
          },
          mockUser,
        ),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw NotFoundException if post is null', async () => {
      ;(postsRepository.findOne as jest.Mock).mockResolvedValue(null)

      await expect(
        service.createComment(
          {
            body: 'test',
            postId: '2',
          },
          mockUser,
        ),
      ).rejects.toThrow(NotFoundException)
    })

    it('should create and return comment without parent', async () => {
      ;(postsRepository.findOne as jest.Mock).mockResolvedValue(postMock)
      ;(commentsRepository.create as jest.Mock).mockResolvedValue(mockComment)

      const result = await service.createComment(
        {
          body: 'test',
          postId: '2',
        },
        mockUser,
      )

      expect(commentsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'test',
          user: mockUser,
        }),
      )
      expect(commentsRepository.save).toHaveBeenCalled()
      expect(result.parent).toEqual(null)
    })

    it('should create and return comment with parent', async () => {
      ;(postsRepository.findOne as jest.Mock).mockResolvedValue(postMock)
      ;(commentsRepository.findOne as jest.Mock).mockResolvedValue(parentMock)
      ;(commentsRepository.create as jest.Mock).mockResolvedValue({
        ...mockComment,
        parent: parentMock,
      })

      const result = await service.createComment(
        {
          body: 'test',
          postId: '2',
          parentId: '3',
        },
        mockUser,
      )

      expect(commentsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'test',
          user: mockUser,
          parent: parentMock,
        }),
      )
      expect(commentsRepository.save).toHaveBeenCalled()
      expect(result.parent).toEqual(parentMock)
    })
  })

  describe('getCommentById', () => {
    it('should throw NotFoundException if comment is null', async () => {
      ;(commentsRepository.findOne as jest.Mock).mockResolvedValue(null)

      await expect(service.getCommentById('1')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should return comment by id', async () => {
      ;(commentsRepository.findOne as jest.Mock).mockResolvedValue(mockComment)

      const result = await service.getCommentById('1')

      expect(result).toEqual(mockComment)
    })
  })

  describe('deleteComment', () => {
    it('should throw NotFoundException if comment is null', async () => {
      ;(commentsRepository.findOne as jest.Mock).mockResolvedValue(null)

      await expect(service.deleteComment('1')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should return comment by id', async () => {
      ;(commentsRepository.findOne as jest.Mock).mockResolvedValue(mockComment)

      await service.deleteComment('1')

      expect(commentsRepository.delete).toHaveBeenCalled()
    })
  })

  describe('getCommentsByPostId', () => {
    it('shoulds return comments', async () => {
      ;(commentsRepository.find as jest.Mock).mockResolvedValue([mockComment])

      const result = await service.getCommentsByPostId('1')

      expect(commentsRepository.find).toHaveBeenCalledWith({
        where: { post: { id: '1' } },
      })
      expect(result).toEqual([mockComment])
    })
  })
})
