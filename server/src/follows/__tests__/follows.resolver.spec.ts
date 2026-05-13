import { Test, TestingModule } from '@nestjs/testing'
import { FollowsResolver } from '../follows.resolver'
import { FollowsService } from '../follows.service'
import { User } from 'src/users/user.entity'

describe('FollowsResolver', () => {
  let resolver: FollowsResolver
  let followsService: Partial<FollowsService>

  const userMock = {
    id: '1',
    username: 'test',
  } as User

  beforeEach(async () => {
    followsService = {
      toggleFollow: jest.fn(),
      getFollowersOfUser: jest.fn(),
      getFollowingOfUser: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsResolver,
        { provide: FollowsService, useValue: followsService },
      ],
    }).compile()

    resolver = module.get<FollowsResolver>(FollowsResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('toggleFollow', () => {
    it('should call service', async () => {
      ;(followsService.toggleFollow as jest.Mock).mockResolvedValue({
        followed: true,
      })

      const result = await resolver.toggleFollow('1', { id: '2' } as User)

      expect(result).toEqual({ followed: true })
      expect(followsService.toggleFollow).toHaveBeenCalled()
    })
  })

  describe('getFollowersOfUser', () => {
    it('should call service', async () => {
      ;(followsService.getFollowersOfUser as jest.Mock).mockResolvedValue([
        userMock,
      ])

      const result = await resolver.getFollowersOfUser('1', 5, 0)

      expect(result).toEqual([userMock])
      expect(followsService.getFollowersOfUser).toHaveBeenCalled()
    })
  })

  describe('getFollowingOfUser', () => {
    it('should call service', async () => {
      ;(followsService.getFollowingOfUser as jest.Mock).mockResolvedValue([
        userMock,
      ])

      const result = await resolver.getFollowingOfUser('1', 5, 0)

      expect(result).toEqual([userMock])
      expect(followsService.getFollowingOfUser).toHaveBeenCalled()
    })
  })
})
