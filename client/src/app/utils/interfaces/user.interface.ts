export interface User {
  id: string
  username: string
  imagePath: string
  email: string
  provider: string
  providerId: string | null
  bio: string | null
  followersCount: number
  followingCount: number
  followedByMe: boolean
}
