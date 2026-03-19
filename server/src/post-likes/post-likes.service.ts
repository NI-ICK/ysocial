import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PostLike } from './post-likes.entity'
import { In, Repository } from 'typeorm'
import DataLoader from 'dataloader'
import { User } from 'src/users/user.entity'
import { Post } from 'src/posts/post.entity'

@Injectable()
export class PostLikesService {
  constructor(
    @InjectRepository(PostLike)
    private postLikesRepository: Repository<PostLike>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async toggleLike(postId: string, user: User) {
    const like = await this.postLikesRepository.findOne({
      where: { postId, userId: user.id },
    })

    if (!like) {
      const post = await this.postsRepository.findOne({ where: { id: postId } })
      if (!post) throw new NotFoundException('Post not found')

      const newLike = this.postLikesRepository.create({
        userId: user.id,
        user,
        postId,
        post,
      })
      await this.postLikesRepository.save(newLike)

      return { addLike: true }
    } else {
      await this.postLikesRepository.delete({ postId, userId: user.id })
      return { addLike: false }
    }
  }

  async getLikesCountByPostId(postId: string) {
    return this.postLikesRepository.count({ where: { postId } })
  }

  private createLikedByMeLoader(userId: string) {
    return new DataLoader<string, boolean>(
      async (postIds: readonly string[]) => {
        const likes = await this.postLikesRepository.find({
          where: { postId: In(postIds as string[]), userId },
        })

        const likedMap = new Map(likes.map((like) => [like.postId, true]))

        return postIds.map((id) => !!likedMap.get(id))
      },
    )
  }

  async isPostLikedByUser(postId: string, userId: string) {
    const loader = this.createLikedByMeLoader(userId)
    return loader.load(postId)
  }
}
