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

  getUserBy(field: Partial<User>) {
    return this.usersRepository.findOne({ where: field })
  }

  async createUser(createUserData: User) {
    const { provider, email } = createUserData
    const user = await this.usersRepository.findOne({ where: { email } })
    if (user && user.provider === provider)
      throw new ConflictException('User with that email already exists')

    const newUser = this.usersRepository.create(createUserData)
    await this.usersRepository.save(newUser)
    return newUser
  }
}
