import { Test, TestingModule } from '@nestjs/testing'
import { CommentsResolver } from '../comments.resolver'
import { CommentsService } from '../comments.service'
import { Comment } from '../comments.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

describe('CommentsResolver', () => {
  let resolver: CommentsResolver
  let commentsService: Partial<CommentsService>
  let commentsRepository: Partial<Repository<Comment>>

  const mockComment = {
    id: '1',
    body: 'test',
    parent: null,
  } as Comment

  beforeEach(async () => {
    commentsService = {
      createComment: jest.fn(),
      deleteComment: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsResolver,
        { provide: CommentsService, useValue: commentsService },
        { provide: getRepositoryToken(Comment), useValue: commentsRepository },
      ],
    }).compile()

    resolver = module.get<CommentsResolver>(CommentsResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('createComment', () => {
    it('should call commentsService.createComment and return the result', async () => {
      ;(commentsService.createComment as jest.Mock).mockResolvedValue(
        mockComment,
      )

      const input = { body: 'test', userId: '1', postId: '2', parentId: null }

      const result = await resolver.createComment(input)

      expect(result).toEqual(mockComment)
    })
  })

  describe('deleteComment', () => {
    it('should call commentsService.deleteComment', async () => {
      const result = await resolver.deleteComment('1')

      expect(result).toEqual({ success: true })
      expect(commentsService.deleteComment).toHaveBeenCalled()
    })
  })
})
