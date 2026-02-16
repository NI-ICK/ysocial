export interface Post {
  id: string
  body: string | null
  image: string | null
  imagePublicId: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    username: string
    imagePath: string
  }
}
