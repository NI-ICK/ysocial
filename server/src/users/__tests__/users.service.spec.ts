import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from '../users.service'
import { Repository } from 'typeorm'
import { User } from '../user.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AuthProvider } from 'src/utils/auth-provider.enum'
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'
import { FileUpload } from 'graphql-upload-ts'
import { UpdateUserProfileImageInput } from '../dtos/update-user-profile-image.input'

describe('UsersService', () => {
  let usersService: UsersService
  let usersRepository: Partial<Repository<User>>
  let cloudinaryService: Partial<CloudinaryService>

  const mockUsersList = [
    { id: '1', email: 'test1@test.com' } as User,
    { id: '2', email: 'test2@test.com' } as User,
  ]
  const mockUser = {
    id: '1',
    email: 'test@test.com',
    username: 'user',
    provider: AuthProvider.GOOGLE,
  } as User
  const mockUser2 = {
    id: '123',
    email: 'test@test.com',
    username: 'user',
    provider: AuthProvider.LOCAL,
    imagePublicId: '123',
  } as User

  beforeEach(async () => {
    usersRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    cloudinaryService = {
      uploadFile: jest.fn(),
      removeFile: jest.fn().mockResolvedValue({}),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: CloudinaryService, useValue: cloudinaryService },
      ],
    }).compile()

    usersService = module.get<UsersService>(UsersService)
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User))
  })

  it('should be defined', () => {
    expect(usersService).toBeDefined()
  })

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      ;(usersRepository.find as jest.Mock).mockResolvedValue(mockUsersList)

      const result = await usersService.getAllUsers()

      expect(usersRepository.find).toHaveBeenCalled()
      expect(result).toEqual(mockUsersList)
    })
  })

  describe('getUserBy', () => {
    it('should return user by id', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser)

      const result = await usersService.getUserBy({ id: '1' })

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      })
      expect(result).toEqual(mockUser)
    })

    it('should return user by email', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser)

      const result = await usersService.getUserBy({ email: 'test@test.com' })

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      })
      expect(result).toEqual(mockUser)
    })

    it('should return user by providerId', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser)

      const result = await usersService.getUserBy({ providerId: '123' })

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { providerId: '123' },
      })
      expect(result).toEqual(mockUser)
    })
  })

  describe('createUser', () => {
    it('should create and return new user', async () => {
      ;(usersRepository.create as jest.Mock).mockReturnValue(mockUser)
      ;(usersRepository.save as jest.Mock).mockResolvedValue(mockUser)
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(null)

      const result = await usersService.createUser(mockUser)

      expect(usersRepository.create).toHaveBeenCalledWith(mockUser)
      expect(usersRepository.save).toHaveBeenCalledWith(mockUser)
      expect(result).toEqual(mockUser)
    })

    it('should throw new ConflictException if user with the same email and provider already exists', async () => {
      const mockUserInDb = {
        id: '3',
        email: 'test@test.com',
        provider: AuthProvider.GOOGLE,
      }

      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(mockUserInDb)

      await expect(usersService.createUser(mockUser)).rejects.toThrow(
        ConflictException,
      )
      expect(usersRepository.create).not.toHaveBeenCalled()
      expect(usersRepository.save).not.toHaveBeenCalled()
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUserInDb.email },
      })
    })
  })

  describe('generateUniqueUsername', () => {
    it('should return the same username if it is unique', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(null)

      const result = await usersService.generateUniqueUsername('test')

      expect(result).toEqual('test')
    })

    it('should generate username with incremented suffix ', async () => {
      ;(usersRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null)

      const result = await usersService.generateUniqueUsername('test')

      expect(result).toEqual('test1')
    })
  })

  describe('updateUser', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(null)

      await expect(
        usersService.updateUser({ newUsername: 'test' }, '123'),
      ).rejects.toThrow(new NotFoundException('User not found'))
    })

    it('should throw BadRequestException if user tries to change email for provider account', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser)

      await expect(
        usersService.updateUser({ newEmail: 'test@test' }, '123'),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException if user tries to change password for provider account', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser)

      await expect(
        usersService.updateUser({ newPassword: 'test' }, '123'),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException newUsername already exists', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser)
      jest.spyOn(usersService, 'isUsernameTaken').mockResolvedValue(true)

      await expect(
        usersService.updateUser({ newUsername: 'test' }, '123'),
      ).rejects.toThrow(BadRequestException)
    })

    it('should set updateData object and update the user with it', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValueOnce(mockUser2)
      ;(usersRepository.findOne as jest.Mock).mockResolvedValueOnce({
        ...mockUser2,
        email: 'test1@test.com',
        username: 'test',
      })
      jest.spyOn(usersService, 'isUsernameTaken').mockResolvedValue(false)

      const result = await usersService.updateUser(
        {
          newEmail: 'test1@test.com',
          newUsername: 'test',
        },
        '123',
      )

      expect(usersRepository.update).toHaveBeenCalled()
      expect(usersRepository.findOne).toHaveBeenCalledTimes(2)
      expect(result).toEqual({
        ...mockUser2,
        email: 'test1@test.com',
        username: 'test',
      })
    })
  })

  describe('isUsernameTaken', () => {
    it('should return true if user exists', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser)

      const result = await usersService.isUsernameTaken('test')

      expect(result).toEqual(true)
    })

    it('should return false if user does not exists', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(null)

      const result = await usersService.isUsernameTaken('test')

      expect(result).toEqual(false)
    })
  })

  describe('isEmailTaken', () => {
    it('should return true if user exists', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser)

      const result = await usersService.isEmailTaken('test@test')

      expect(result).toEqual(true)
    })

    it('should return false if user does not exists', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(null)

      const result = await usersService.isEmailTaken('test@test')

      expect(result).toEqual(false)
    })
  })

  describe('deleteUser', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(null)

      await expect(usersService.deleteUser('123')).rejects.toThrow(
        new NotFoundException('User not found'),
      )
    })

    it('should call delete and cloudinaryService if imagePublicId exists', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser2)

      await usersService.deleteUser('123')

      expect(usersRepository.delete).toHaveBeenCalled()
      expect(cloudinaryService.removeFile).toHaveBeenCalled()
    })

    it('should only call delete if imagePublicId does not exists', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue({
        ...mockUser2,
        imagePublicId: null,
      })

      await usersService.deleteUser('123')

      expect(usersRepository.delete).toHaveBeenCalled()
      expect(cloudinaryService.removeFile).not.toHaveBeenCalled()
    })
  })

  describe('updateUserProfileImage', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(null)

      const input = {
        image: Promise.resolve({
          createReadStream: jest.fn(),
        } as Partial<FileUpload>),
      } as UpdateUserProfileImageInput

      await expect(
        usersService.updateUserProfileImage(input, '123'),
      ).rejects.toThrow(new NotFoundException('User not found'))
    })

    it('should update and remove prev file if it exists', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser2)
      ;(cloudinaryService.uploadFile as jest.Mock).mockResolvedValue({
        secure_url: '',
        public_id: '',
      })

      const input = {
        image: Promise.resolve({
          createReadStream: jest.fn(),
        } as Partial<FileUpload>),
      } as UpdateUserProfileImageInput

      const result = await usersService.updateUserProfileImage(input, '123')

      expect(result).toEqual(mockUser2)
      expect(cloudinaryService.uploadFile).toHaveBeenCalled()
      expect(cloudinaryService.removeFile).toHaveBeenCalled()
      expect(usersRepository.update).toHaveBeenCalled()
      expect(usersRepository.findOne).toHaveBeenCalledTimes(2)
    })

    it('should only update if prev file does not exists', async () => {
      ;(usersRepository.findOne as jest.Mock).mockResolvedValue({
        ...mockUser2,
        imagePublicId: null,
      })
      ;(cloudinaryService.uploadFile as jest.Mock).mockResolvedValue({
        secure_url: '',
        public_id: '',
      })

      const input = {
        image: Promise.resolve({
          createReadStream: jest.fn(),
        } as Partial<FileUpload>),
      } as UpdateUserProfileImageInput

      const result = await usersService.updateUserProfileImage(input, '123')

      expect(result).toEqual({
        ...mockUser2,
        imagePublicId: null,
      })
      expect(cloudinaryService.uploadFile).toHaveBeenCalled()
      expect(usersRepository.update).toHaveBeenCalled()
      expect(usersRepository.findOne).toHaveBeenCalledTimes(2)
    })
  })
})
