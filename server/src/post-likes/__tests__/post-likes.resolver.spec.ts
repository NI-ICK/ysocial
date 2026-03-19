import { Test, TestingModule } from '@nestjs/testing'
import { PostLikesResolver } from '../post-likes.resolver'
import { PostLikesService } from '../post-likes.service'
import { User } from 'src/users/user.entity'

describe('PostLikesResolver', () => {
  let resolver: PostLikesResolver
  let postLikesService: Partial<PostLikesService>

  beforeEach(async () => {
    postLikesService = {
      toggleLike: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostLikesResolver,
        { provide: PostLikesService, useValue: postLikesService },
      ],
    }).compile()

    resolver = module.get<PostLikesResolver>(PostLikesResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('toggleCommentLike', () => {
    it('should call service', async () => {
      ;(postLikesService.toggleLike as jest.Mock).mockResolvedValue({
        addLike: true,
      })

      const result = await resolver.togglePostLike('1', {
        id: '1',
        username: 'test',
      } as User)

      expect(result).toEqual({ addLike: true })
    })
  })
})
