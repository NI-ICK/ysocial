import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Post } from './post.entity'
import { Repository } from 'typeorm'
import { CreatePostInput } from './dtos/create-post.input'
import { randomUUID } from 'crypto'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'
import { EditPostInput } from './dtos/edit-post.input'
import { User } from 'src/users/user.entity'

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createPost(data: CreatePostInput, user: User) {
    const { body, image } = data

    if (!body?.trim() && !(await image)) {
      throw new BadRequestException('Post must have a body or an image')
    }

    let imageUrl = ''
    let imageId = ''
    if (image) {
      const file = await image
      const upload = await this.cloudinaryService.uploadFile(
        file,
        'ysocial/posts',
      )
      imageUrl = upload.secure_url as string
      imageId = upload.public_id as string
    }

    const newPost = this.postsRepository.create({
      id: randomUUID(),
      body,
      image: imageUrl,
      imagePublicId: imageId,
      user,
    })
    await this.postsRepository.save(newPost)

    return newPost
  }

  async editPost(data: EditPostInput) {
    const post = await this.postsRepository.findOne({ where: { id: data.id } })
    if (!post) throw new NotFoundException('Post not found')

    post.body = data.body

    return await this.postsRepository.save(post)
  }

  getPostById(id: string) {
    return this.postsRepository.findOne({ where: { id } })
  }

  async getPosts(limit: number, offset: number) {
    if (offset < 0) throw new BadRequestException('Invalid offset')

    return await this.postsRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    })
  }

  async deletePost(id: string) {
    const post = await this.postsRepository.findOne({ where: { id } })
    if (!post) throw new NotFoundException('Post not found')

    await this.postsRepository.delete(id)
    if (post.imagePublicId)
      await this.cloudinaryService.removeFile(post.imagePublicId)
  }

  async getPostsCreatedByUser(userId: string, limit: number, offset: number) {
    return await this.postsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    })
  }
}
