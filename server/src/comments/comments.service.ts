import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateCommentInput } from './dtos/create-comment.input'
import { Comment } from './comments.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { randomUUID } from 'crypto'
import { User } from 'src/users/user.entity'
import { Post } from 'src/posts/post.entity'

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}

  async createComment(data: CreateCommentInput, user: User) {
    const { parentId, postId, body } = data

    if (!body) throw new BadRequestException('Message is required')

    let parent: Comment | null = null
    if (parentId) {
      parent = await this.commentsRepository.findOne({
        where: { id: parentId },
      })

      if (!parent) throw new NotFoundException('Parent Comment not found')
    }

    const post = await this.postsRepository.findOne({ where: { id: postId } })
    if (!post) throw new NotFoundException('Post not found')

    const comment = this.commentsRepository.create({
      id: randomUUID(),
      body: body,
      user,
      parent,
      post,
    })

    await this.commentsRepository.save(comment)

    return comment
  }

  async getCommentById(id: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user', 'post', 'parent', 'children'],
    })
    if (!comment) throw new NotFoundException('Comment not found')

    return comment
  }

  async deleteComment(id: string) {
    const comment = await this.commentsRepository.findOne({ where: { id } })
    if (!comment) throw new NotFoundException('Comment not found')

    await this.commentsRepository.delete(id)
  }

  async getCommentsByPostId(postId: string) {
    const comments = await this.commentsRepository.find({
      where: { post: { id: postId } },
    })

    return comments
  }
}
