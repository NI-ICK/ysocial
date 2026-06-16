import { Test, TestingModule } from '@nestjs/testing'
import { UsersResolver } from '../users.resolver'
import { UsersService } from '../users.service'
import { FollowsService } from 'src/follows/follows.service'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { User } from '../user.entity'
import { UpdateUserProfileImageInput } from '../dtos/update-user-profile-image.input'
import { FileUpload } from 'graphql-upload-ts'

describe('UsersResolver', () => {
  let usersResolver: UsersResolver
  let usersService: Partial<UsersService>
  let followsService: Partial<FollowsService>
  const mockUsers = [
    {
      id: '1',
      email: 'test1@test.com',
      password: 'pass',
      username: 'user1',
    } as User,
    {
      id: '2',
      email: 'test2@test.com',
      password: 'pass',
      username: 'user2',
    } as User,
  ]

  beforeEach(async () => {
    usersService = {
      getUserBy: jest.fn(),
      getAllUsers: jest.fn(),
      updateUser: jest.fn(),
      isUsernameTaken: jest.fn(),
      isEmailTaken: jest.fn(),
      deleteUser: jest.fn(),
      updateUserProfileImage: jest.fn(),
    }

    followsService = {
      getFollowedByMe: jest.fn(),
      getFollowersCountOfUser: jest.fn(),
      getFollowingCountOfUser: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        { provide: UsersService, useValue: usersService },
        { provide: FollowsService, useValue: followsService },
      ],
    }).compile()

    usersResolver = module.get<UsersResolver>(UsersResolver)
  })

  it('should be defined', () => {
    expect(usersResolver).toBeDefined()
    expect(usersService).toBeDefined()
  })

  describe('getAllUsers', () => {
    it('should call usersService.getAllUsers', async () => {
      ;(usersService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers)
      const result = await usersResolver.getAllUsers()

      expect(usersService.getAllUsers).toHaveBeenCalled()
      expect(result).toEqual(mockUsers)
    })
  })

  describe('getUserByUsername', () => {
    it('should throw NotFoundException when usersService return null', async () => {
      ;(usersService.getUserBy as jest.Mock).mockResolvedValue(null)
      await expect(usersResolver.getUserByUsername('test')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should call usersService.getUserByUsername', async () => {
      ;(usersService.getUserBy as jest.Mock).mockResolvedValue(mockUsers[0])
      const result = await usersResolver.getUserByUsername('test')

      expect(usersService.getUserBy).toHaveBeenCalledWith({ username: 'test' })
      expect(result).toEqual(mockUsers[0])
    })
  })

  describe('isUsernameTaken', () => {
    it('should call usersService', async () => {
      await usersResolver.isUsernameTaken('test')

      expect(usersService.isUsernameTaken).toHaveBeenCalledWith('test')
    })
  })

  describe('isEmailTaken', () => {
    it('should call usersService', async () => {
      await usersResolver.isEmailTaken('test@test.com')

      expect(usersService.isEmailTaken).toHaveBeenCalledWith('test@test.com')
    })
  })

  describe('updateUser', () => {
    it('should throw UnauthorizedException if user is null', async () => {
      await expect(
        usersResolver.updateUser({ newUsername: 'test' }, null),
      ).rejects.toThrow(new UnauthorizedException('You are not logged in'))
    })

    it('should call usersService and return user', async () => {
      ;(usersService.updateUser as jest.Mock).mockResolvedValue(mockUsers[0])

      const result = await usersResolver.updateUser(
        { newUsername: 'test' },
        mockUsers[0],
      )

      expect(result).toEqual(mockUsers[0])
      expect(usersService.updateUser).toHaveBeenCalled()
    })
  })

  describe('deleteUser', () => {
    it('should throw UnauthorizedException if user is null', async () => {
      await expect(usersResolver.deleteUser(null)).rejects.toThrow(
        new UnauthorizedException('You are not logged in'),
      )
    })

    it('should call usersService and return response', async () => {
      const result = await usersResolver.deleteUser(mockUsers[0])

      expect(result).toEqual({ success: true, message: 'User deleted' })
      expect(usersService.deleteUser).toHaveBeenCalled()
    })
  })

  describe('updateUserProfileImage', () => {
    it('should throw UnauthorizedException if user is null', async () => {
      const input = {
        image: Promise.resolve({
          createReadStream: jest.fn(),
        } as Partial<FileUpload>),
      } as UpdateUserProfileImageInput

      await expect(
        usersResolver.updateUserProfileImage(input, null),
      ).rejects.toThrow(new UnauthorizedException('You are not logged in'))
    })

    it('should call usersService and return user', async () => {
      ;(usersService.updateUserProfileImage as jest.Mock).mockResolvedValue(
        mockUsers[0],
      )

      const input = {
        image: Promise.resolve({
          createReadStream: jest.fn(),
        } as Partial<FileUpload>),
      } as UpdateUserProfileImageInput

      const result = await usersResolver.updateUserProfileImage(
        input,
        mockUsers[0],
      )

      expect(result).toEqual(mockUsers[0])
      expect(usersService.updateUserProfileImage).toHaveBeenCalled()
    })
  })

  describe('@ResolveField', () => {
    describe('followedByMe', () => {
      it('should return false if currentUser is not provided', () => {
        const result = usersResolver.followedByMe({ id: '1' } as User, null)

        expect(result).toEqual(false)
      })

      it('should call service and return resonse', () => {
        ;(followsService.getFollowedByMe as jest.Mock).mockReturnValue(true)

        const result = usersResolver.followedByMe(
          { id: '1' } as User,
          { id: '2' } as User,
        )

        expect(result).toEqual(true)
      })
    })

    describe('followersCount', () => {
      it('should call service and return resonse', () => {
        ;(followsService.getFollowersCountOfUser as jest.Mock).mockReturnValue(
          2,
        )

        const result = usersResolver.followersCount(mockUsers[0])

        expect(result).toEqual(2)
      })
    })

    describe('followingCount', () => {
      it('should call service and return resonse', () => {
        ;(followsService.getFollowingCountOfUser as jest.Mock).mockReturnValue(
          2,
        )

        const result = usersResolver.followingCount(mockUsers[0])

        expect(result).toEqual(2)
      })
    })
  })
})
