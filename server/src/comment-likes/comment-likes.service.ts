import { Injectable, NotFoundException } from '@nestjs/common'
import { CommentLike } from './comment-likes.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { User } from 'src/users/user.entity'
import DataLoader from 'dataloader'
import { Comment } from 'src/comments/comments.entity'

@Injectable()
export class CommentLikesService {
  constructor(
    @InjectRepository(CommentLike)
    private commentLikesRepository: Repository<CommentLike>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async getLikesCountByCommentId(commentId: string) {
    return await this.commentLikesRepository.count({ where: { commentId } })
  }

  async toggleLike(commentId: string, user: User) {
    const like = await this.commentLikesRepository.findOne({
      where: { commentId, userId: user.id },
    })

    if (!like) {
      const comment = await this.commentsRepository.findOne({
        where: { id: commentId },
      })
      if (!comment) throw new NotFoundException('Comment not found')

      const newLike = this.commentLikesRepository.create({
        userId: user.id,
        user,
        commentId,
        comment,
      })
      await this.commentLikesRepository.save(newLike)

      return { addLike: true }
    } else {
      await this.commentLikesRepository.delete({ commentId, userId: user.id })
      return { addLike: false }
    }
  }

  private createLikedByMeLoader(userId: string) {
    return new DataLoader<string, boolean>(
      async (commentIds: readonly string[]) => {
        const likes = await this.commentLikesRepository.find({
          where: { commentId: In(commentIds as string[]), userId },
        })

        const likedMap = new Map(likes.map((like) => [like.commentId, true]))

        return commentIds.map((id) => !!likedMap.get(id))
      },
    )
  }

  async isCommentLikedByUser(commentId: string, userId: string) {
    const loader = this.createLikedByMeLoader(userId)
    return loader.load(commentId)
  }
}
