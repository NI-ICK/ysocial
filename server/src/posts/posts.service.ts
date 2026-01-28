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
import { UsersService } from 'src/users/users.service'
import { EditPostInput } from './dtos/edit-post.input'

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    private usersService: UsersService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createPost(data: CreatePostInput) {
    const { title, body, image, userId } = data

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

    const user = await this.usersService.getUserBy({ id: userId })
    if (!user) throw new NotFoundException('User not found')

    const newPost = this.postsRepository.create({
      id: randomUUID(),
      title,
      body,
      image: imageUrl,
      user,
      imagePublicId: imageId,
    })
    await this.postsRepository.save(newPost)

    return newPost
  }

  async editPost(data: EditPostInput) {
    const post = await this.postsRepository.findOne({ where: { id: data.id } })
    if (!post) throw new NotFoundException('Post not found')

    if (data.title !== undefined) post.title = data.title
    if (data.body !== undefined) post.body = data.body

    return await this.postsRepository.save(post)
  }

  getPostById(id: string) {
    return this.postsRepository.findOne({ where: { id } })
  }

  getAllPosts() {
    return this.postsRepository.find()
  }

  async deletePost(id: string) {
    const post = await this.postsRepository.findOne({ where: { id } })
    if (!post) throw new NotFoundException('Post not found')

    await this.postsRepository.delete(id)
    if (post.imagePublicId)
      await this.cloudinaryService.removeFile(post.imagePublicId)
  }
}
