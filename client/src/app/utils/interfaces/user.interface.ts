export interface User {
  id: string
  username: string
  email: string
  provider: string
  providerId: string | null
  imagePath: string
  bio: string | null
  followersCount: number
  followingCount: number
  followedByMe: boolean
}
