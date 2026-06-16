import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './user.entity'
import { Repository } from 'typeorm'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'
import { UpdateUserInput } from './dtos/update-user.input'
import { AuthProvider } from 'src/utils/auth-provider.enum'
import * as bcrypt from 'bcrypt'
import { UpdateUserProfileImageInput } from './dtos/update-user-profile-image.input'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private cloudinaryService: CloudinaryService,
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
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    })
    if (user && user.provider === provider)
      throw new ConflictException('User with that email already exists')

    let newUsername = username
    const existingUser = await this.getUserBy({ username })
    if (existingUser) newUsername = await this.generateUniqueUsername(username)

    const newUser = this.usersRepository.create({
      ...createUserData,
      email: createUserData.email.toLowerCase(),
      username: newUsername,
    })
    await this.usersRepository.save(newUser)
    return newUser
  }

  async updateUser(data: UpdateUserInput, userId: string) {
    const { newPassword, newEmail, newUsername, newBio } = data
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    })
    if (!user) throw new NotFoundException('User not found')

    if (newEmail && user.provider !== AuthProvider.LOCAL) {
      throw new BadRequestException(
        `You can't change your email because your account is linked to ${user.provider}`,
      )
    }

    if (newPassword && user.provider !== AuthProvider.LOCAL) {
      throw new BadRequestException(
        `You can't change your password because your account is linked to ${user.provider}`,
      )
    }

    if (newUsername && (await this.isUsernameTaken(newUsername)))
      throw new BadRequestException('Username is already taken')

    const updateData: Partial<User> = {}
    if (newBio !== undefined && newBio) updateData.bio = newBio
    if (newEmail !== undefined && newEmail) updateData.email = newEmail
    if (newUsername !== undefined && newUsername)
      updateData.username = newUsername
    if (newPassword !== undefined && newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      updateData.password = hashedPassword
    }

    await this.usersRepository.update({ id: userId }, updateData)

    const updatedUser = await this.usersRepository.findOne({
      where: { id: userId },
    })

    return updatedUser
  }

  async isUsernameTaken(username: string) {
    const user = await this.usersRepository.findOne({
      where: { username: username.toLowerCase() },
    })
    return !!user
  }

  async isEmailTaken(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase(), provider: AuthProvider.LOCAL },
    })
    return !!user
  }

  async deleteUser(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    await this.usersRepository.delete(userId)
    if (user.imagePublicId)
      await this.cloudinaryService.removeFile(user.imagePublicId)
  }

  async updateUserProfileImage(
    data: UpdateUserProfileImageInput,
    userId: string,
  ) {
    const user = await this.usersRepository.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException('User not found')

    let prevImgId = ''
    if (user.imagePublicId) prevImgId = user.imagePublicId

    const file = await data.image
    const upload = await this.cloudinaryService.uploadFile(
      file,
      'ysocial/profile',
    )
    const imageUrl = upload.secure_url as string
    const imageId = upload.public_id as string

    await this.usersRepository.update(
      { id: userId },
      { imagePath: imageUrl, imagePublicId: imageId },
    )

    if (prevImgId) {
      this.cloudinaryService.removeFile(prevImgId).catch((err: Error) => {
        console.error('Failed to delete old image:', err.message)
      })
    }

    const updatedUser = await this.usersRepository.findOne({
      where: { id: userId },
    })
    return updatedUser
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
