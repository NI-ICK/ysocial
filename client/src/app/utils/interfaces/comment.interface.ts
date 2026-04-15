import { User } from './user.interface'

export interface Comment {
  id: string
  postId: string
  body: string
  likesCount: number
  likedByMe: boolean
  repliesCount: number
  createdAt: string
  user: {
    id: string
    username: string
    imagePath: string
  }
  parent: {
    id: string
  } | null
}
