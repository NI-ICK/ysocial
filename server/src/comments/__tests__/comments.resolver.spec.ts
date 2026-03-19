import { Test, TestingModule } from '@nestjs/testing'
import { CommentsResolver } from '../comments.resolver'
import { CommentsService } from '../comments.service'
import { Comment } from '../comments.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from 'src/users/user.entity'
import { CommentLikesService } from 'src/comment-likes/comment-likes.service'

describe('CommentsResolver', () => {
  let resolver: CommentsResolver
  let commentsService: Partial<CommentsService>
  let commentsRepository: Partial<Repository<Comment>>
  let commentLikesService: Partial<CommentLikesService>

  const mockUser = {
    id: '1',
    username: 'test',
  } as User

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
    commentLikesService = {
      getLikesCountByCommentId: jest.fn(),
      isCommentLikedByUser: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsResolver,
        { provide: CommentsService, useValue: commentsService },
        { provide: CommentLikesService, useValue: commentLikesService },
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

      const result = await resolver.createComment(input, mockUser)

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

  describe('@ResolveField', () => {
    describe('likesCount', () => {
      it('should call call service and return resonse', () => {
        ;(
          commentLikesService.getLikesCountByCommentId as jest.Mock
        ).mockReturnValue(2)

        const result = resolver.likesCount({ id: '1' } as Comment)

        expect(result).toEqual(2)
      })
    })

    describe('likedByMe', () => {
      it('should return false if user is not provided', () => {
        const result = resolver.likedByMe({ id: '1' } as Comment, null)

        expect(result).toEqual(false)
      })

      it('should call call service and return resonse', () => {
        ;(
          commentLikesService.isCommentLikedByUser as jest.Mock
        ).mockReturnValue(true)

        const result = resolver.likedByMe(
          { id: '1' } as Comment,
          { id: '1' } as User,
        )

        expect(result).toEqual(true)
      })
    })
  })
})
