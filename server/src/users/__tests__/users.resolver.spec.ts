import { Test, TestingModule } from '@nestjs/testing'
import { UsersResolver } from '../users.resolver'
import { UsersService } from '../users.service'

describe('UsersResolver', () => {
  let usersResolver: UsersResolver
  let usersService: Partial<UsersService>
  const mockUsers = [
    {
      id: '1',
      email: 'test1@test.com',
      password: 'pass',
      username: 'user1',
    },
    {
      id: '2',
      email: 'test2@test.com',
      password: 'pass',
      username: 'user2',
    },
  ]

  beforeEach(async () => {
    usersService = {
      getUserBy: jest.fn(),
      getAllUsers: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersResolver,
        { provide: UsersService, useValue: usersService },
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
})
