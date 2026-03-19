import { Test, TestingModule } from '@nestjs/testing'
import { CommentLikesResolver } from '../comment-likes.resolver'
import { CommentLikesService } from '../comment-likes.service'
import { User } from 'src/users/user.entity'

describe('LikesResolver', () => {
  let resolver: CommentLikesResolver
  let commentLikesService: Partial<CommentLikesService>

  beforeEach(async () => {
    commentLikesService = {
      toggleLike: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentLikesResolver,
        { provide: CommentLikesService, useValue: commentLikesService },
      ],
    }).compile()

    resolver = module.get<CommentLikesResolver>(CommentLikesResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('toggleCommentLike', () => {
    it('should call service', async () => {
      ;(commentLikesService.toggleLike as jest.Mock).mockResolvedValue({
        addLike: true,
      })

      const result = await resolver.toggleCommentLike('1', {
        id: '1',
        username: 'test',
      } as User)

      expect(result).toEqual({ addLike: true })
    })
  })
})
