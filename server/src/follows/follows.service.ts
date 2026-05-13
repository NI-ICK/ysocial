import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Follow } from './follow.entity'
import { Repository } from 'typeorm'
import { User } from 'src/users/user.entity'

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow) private followRepository: Repository<Follow>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId)
      throw new BadRequestException('You cannot follow yourself')

    const [follower, following] = await Promise.all([
      this.usersRepository.findOne({ where: { id: followerId } }),
      this.usersRepository.findOne({ where: { id: followingId } }),
    ])

    if (!follower || !following) throw new NotFoundException('User not found')

    const existing = await this.followRepository.findOne({
      where: { followerId, followingId },
    })

    if (existing) {
      await this.followRepository.remove(existing)
      return { followed: false }
    }

    const follow = this.followRepository.create({
      followerId,
      followingId,
    })

    await this.followRepository.save(follow)

    return { followed: true }
  }

  async getFollowersOfUser(username: string, limit: number, offset: number) {
    if (offset < 0) throw new BadRequestException('Invalid offset')

    const user = await this.usersRepository.findOne({ where: { username } })
    if (!user) throw new NotFoundException('User not found')

    const follows = await this.followRepository.find({
      where: { followingId: user.id },
      relations: ['follower'],
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      skip: offset,
    })

    return follows.map((f) => f.follower)
  }

  async getFollowingOfUser(username: string, limit: number, offset: number) {
    if (offset < 0) throw new BadRequestException('Invalid offset')

    const user = await this.usersRepository.findOne({ where: { username } })
    if (!user) throw new NotFoundException('User not found')

    const follows = await this.followRepository.find({
      where: { followerId: user.id },
      relations: ['following'],
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      skip: offset,
    })

    return follows.map((f) => f.following)
  }

  async getFollowersCountOfUser(userId: string) {
    return await this.followRepository.count({ where: { followingId: userId } })
  }

  async getFollowingCountOfUser(userId: string) {
    return await this.followRepository.count({ where: { followerId: userId } })
  }

  async getFollowedByMe(followerId: string, followingId: string) {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    })
    return !!follow
  }
}
