import { User } from './user.interface'

export interface Post {
  id: string
  title?: string
  body?: string
  image?: string
  imagePublicId?: string
  user: User
}
