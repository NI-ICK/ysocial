import { Test, TestingModule } from '@nestjs/testing'
import { FollowsService } from '../follows.service'
import { Repository } from 'typeorm'
import { Follow } from '../follow.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from 'src/users/user.entity'
import { BadRequestException, NotFoundException } from '@nestjs/common'

describe('FollowsService', () => {
  let service: FollowsService
  let followsRepository: Partial<Repository<Follow>>
  let usersRepository: Partial<Repository<User>>

  const userMock1 = {
    id: '1',
  } as User
  const userMock2 = {
    id: '2',
  } as User
  const followMock = {
    followerId: '1',
    followingId: '2',
    follower: userMock1,
    following: userMock2,
  } as Follow

  beforeEach(async () => {
    followsRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    }
    usersRepository = {
      findOne: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsService,
        {
          provide: getRepositoryToken(Follow),
          useValue: followsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
      ],
    }).compile()

    service = module.get<FollowsService>(FollowsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('toggleFollow', () => {
    it('should throw BadRequestException if both ids are the same', async () => {
      await expect(service.toggleFollow('1', '1')).rejects.toThrow(
        new BadRequestException('You cannot follow yourself'),
      )
    })

    it('should throw NotFoundException if user with provided id does not exist', async () => {
      ;(usersRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(userMock1)
        .mockResolvedValueOnce(null)

      await expect(service.toggleFollow('1', '2')).rejects.toThrow(
        new NotFoundException('User not found'),
      )
    })

    it('should follow user if follow does not exist', async () => {
      ;(followsRepository.findOne as jest.Mock).mockResolvedValue(null)
      ;(usersRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(userMock1)
        .mockResolvedValueOnce(userMock2)

      const result = await service.toggleFollow('1', '2')

      expect(result).toEqual({ followed: true })
      expect(followsRepository.create).toHaveBeenCalled()
      expect(followsRepository.save).toHaveBeenCalled()
    })

    it('should unfollow user if follow does exist', async () => {
      ;(followsRepository.findOne as jest.Mock).mockResolvedValue(followMock)
      ;(usersRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(userMock1)
        .mockResolvedValueOnce(userMock2)

      const result = await service.toggleFollow('1', '2')

      expect(result).toEqual({ followed: false })
      expect(followsRepository.remove).toHaveBeenCalled()
    })
  })

  describe('getFollowersOfUser', () => {
    it('should throw BadRequestException if offset is below 0', async () => {
      await expect(service.getFollowersOfUser('test', 5, -1)).rejects.toThrow(
        new BadRequestException('Invalid offset'),
      )
    })

    it('should throw NotFoundException if user does not exist', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(null)

      await expect(service.getFollowersOfUser('test', 5, 0)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should return followers if user exists', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(userMock1)
      ;(followsRepository.find as jest.Mock).mockResolvedValue([followMock])

      const result = await service.getFollowersOfUser('test', 5, 0)

      expect(result).toEqual([userMock1])
    })
  })

  describe('getFollowingOfUser', () => {
    it('should throw BadRequestException if offset is below 0', async () => {
      await expect(service.getFollowersOfUser('test', 5, -1)).rejects.toThrow(
        new BadRequestException('Invalid offset'),
      )
    })

    it('should throw NotFoundException if user does not exist', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(null)

      await expect(service.getFollowingOfUser('test', 5, 0)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should return following if user exists', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(userMock1)
      ;(followsRepository.find as jest.Mock).mockResolvedValue([followMock])

      const result = await service.getFollowingOfUser('test', 5, 0)

      expect(result).toEqual([userMock2])
    })
  })

  describe('getFollowersCountOfUser', () => {
    it('should return count of followers', async () => {
      ;(followsRepository.count as jest.Mock).mockResolvedValue(2)

      const result = await service.getFollowersCountOfUser('1')

      expect(result).toEqual(2)
    })
  })

  describe('getFollowingCountOfUser', () => {
    it('should return count of following', async () => {
      ;(followsRepository.count as jest.Mock).mockResolvedValue(2)

      const result = await service.getFollowingCountOfUser('1')

      expect(result).toEqual(2)
    })
  })

  describe('getFollowedByMe', () => {
    it('should return followedByMe', async () => {
      ;(followsRepository.findOne as jest.Mock).mockResolvedValue(followMock)

      const result = await service.getFollowedByMe('1', '2')

      expect(result).toEqual(true)
    })
  })
})
