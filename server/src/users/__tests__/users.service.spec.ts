import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from '../users.service'
import { Repository } from 'typeorm'
import { User } from '../user.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AuthProvider } from 'src/utils/auth-provider.enum'
import { ConflictException } from '@nestjs/common'

describe('UsersService', () => {
  let usersService: UsersService
  let usersRepository: Partial<Repository<User>>
  const mockUsersList = [
    { id: '1', email: 'test1@test.com' } as User,
    { id: '2', email: 'test2@test.com' } as User,
  ]
  const mockUser = {
    id: '1',
    email: 'test@test.com',
    username: 'user',
    provider: AuthProvider.GOOGLE,
  }

  beforeEach(async () => {
    usersRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepository },
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

      const result = await usersService.createUser(mockUser as User)

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

      await expect(usersService.createUser(mockUser as User)).rejects.toThrow(
        ConflictException,
      )
      expect(usersRepository.create).not.toHaveBeenCalled()
      expect(usersRepository.save).not.toHaveBeenCalled()
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUserInDb.email },
      })
    })
  })
})
