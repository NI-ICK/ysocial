import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './user.entity'
import { Repository } from 'typeorm'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  getAllUsers() {
    return this.usersRepository.find()
  }

  getUserBy(
    field: Pick<
      Partial<User>,
      'id' | 'email' | 'username' | 'provider' | 'providerId'
    >,
  ) {
    return this.usersRepository.findOne({ where: field })
  }

  async createUser(createUserData: User) {
    const { provider, email, username } = createUserData
    const user = await this.usersRepository.findOne({ where: { email } })
    if (user && user.provider === provider)
      throw new ConflictException('User with that email already exists')

    let newUsername = username
    const existingUser = await this.getUserBy({ username })
    if (existingUser) newUsername = await this.generateUniqueUsername(username)

    const newUser = this.usersRepository.create({
      ...createUserData,
      username: newUsername,
    })
    await this.usersRepository.save(newUser)
    return newUser
  }

  async generateUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername
    let counter = 1

    while (true) {
      const existingUser = await this.getUserBy({ username })
      if (!existingUser) return username

      username = `${baseUsername}${counter}`
      counter++
    }
  }
}
