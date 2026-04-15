export interface Post {
  id: string
  body: string | null
  image: string | null
  imagePublicId: string | null
  createdAt: string
  updatedAt: string
  likesCount: number
  likedByMe: boolean
  commentsCount: number
  user: {
    id: string
    username: string
    imagePath: string
  }
}
