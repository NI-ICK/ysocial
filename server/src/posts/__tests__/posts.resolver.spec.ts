import { Test, TestingModule } from '@nestjs/testing'
import { PostsResolver } from '../posts.resolver'
import { PostsService } from '../posts.service'
import { Post } from '../post.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from 'src/users/user.entity'
import { PostLikesService } from 'src/post-likes/post-likes.service'
import { CommentsService } from 'src/comments/comments.service'

describe('PostsResolver', () => {
  let resolver: PostsResolver
  let service: Partial<PostsService>
  let postsRepository: Partial<Repository<Post>>
  let postLikesService: Partial<PostLikesService>
  let commentsService: Partial<CommentsService>

  const mockUser = {
    id: '1',
    username: 'test',
  } as User

  beforeEach(async () => {
    service = {
      createPost: jest.fn(),
      editPost: jest.fn(),
      getPostById: jest.fn(),
      getAllPosts: jest.fn(),
      deletePost: jest.fn(),
    }
    postLikesService = {
      getLikesCountByPostId: jest.fn(),
      isPostLikedByUser: jest.fn(),
    }
    commentsService = {
      getCommentsByPostId: jest.fn(),
      getCommentsCountByPostId: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsResolver,
        { provide: PostsService, useValue: service },
        { provide: PostLikesService, useValue: postLikesService },
        { provide: CommentsService, useValue: commentsService },
        { provide: getRepositoryToken(Post), useValue: postsRepository },
      ],
    }).compile()

    resolver = module.get<PostsResolver>(PostsResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('createPost', () => {
    it('should call postsService.createPost and return the result', async () => {
      const input = { body: 'test', userId: '1' }
      const mockPost = { id: '1', ...input }

      ;(service.createPost as jest.Mock).mockResolvedValue(mockPost)

      const result = await resolver.createPost(input, mockUser)
      expect(result).toEqual(mockPost)
    })
  })

  describe('editPost', () => {
    it('should call postsService.editPost and return the result', async () => {
      const input = { body: 'test2', id: '1' }
      const mockPost = { body: 'test1', id: '1' } as Post

      ;(service.editPost as jest.Mock).mockResolvedValue(mockPost)

      const result = await resolver.editPost(input)
      expect(result).toEqual(mockPost)
    })
  })

  describe('getPostById', () => {
    it('should call postsService.getPostById and return the result', async () => {
      const mockPost = { body: 'test', id: '1' }

      ;(service.getPostById as jest.Mock).mockResolvedValue(mockPost)

      const result = await resolver.getPostById('1')
      expect(result).toEqual(mockPost)
      expect(service.getPostById).toHaveBeenCalledWith('1')
    })
  })

  describe('getAllPosts', () => {
    it('should call postsService.getAllPosts and return the result', async () => {
      const mockPosts = [
        { body: 'test', id: '1' },
        { body: 'test2', id: '2' },
      ]

      ;(service.getAllPosts as jest.Mock).mockResolvedValue(mockPosts)

      const result = await resolver.getAllPosts()
      expect(result).toEqual(mockPosts)
      expect(service.getAllPosts).toHaveBeenCalled()
    })
  })

  describe('deletePost', () => {
    it('should call postsService.deletePost and return the result', async () => {
      ;(service.deletePost as jest.Mock).mockResolvedValue(undefined)

      const result = await resolver.deletePost('1')
      expect(result).toEqual({ success: true, message: 'Post deleted' })
      expect(service.deletePost).toHaveBeenCalledWith('1')
    })
  })

  describe('@ResolveField', () => {
    describe('likesCount', () => {
      it('should call call service and return resonse', () => {
        ;(postLikesService.getLikesCountByPostId as jest.Mock).mockReturnValue(
          2,
        )

        const result = resolver.likesCount({ id: '1' } as Post)

        expect(result).toEqual(2)
      })
    })

    describe('likedByMe', () => {
      it('should return false if user is not provided', () => {
        const result = resolver.likedByMe({ id: '1' } as Post, null)

        expect(result).toEqual(false)
      })

      it('should call call service and return resonse', () => {
        ;(postLikesService.isPostLikedByUser as jest.Mock).mockReturnValue(true)

        const result = resolver.likedByMe(
          { id: '1' } as Post,
          { id: '1' } as User,
        )

        expect(result).toEqual(true)
      })
    })

    describe('comments', () => {
      it('should call commentsService', () => {
        const commentArray = [{ id: '1' }, { id: '2' }]

        ;(commentsService.getCommentsByPostId as jest.Mock).mockReturnValue(
          commentArray,
        )

        const result = resolver.comments({ id: '3' } as Post)

        expect(commentsService.getCommentsByPostId).toHaveBeenCalled()
        expect(result).toEqual(commentArray)
      })
    })

    describe('commentsCount', () => {
      it('should return comments count', async () => {
        ;(
          commentsService.getCommentsCountByPostId as jest.Mock
        ).mockResolvedValue(2)

        const result = await resolver.commentsCount({
          id: '1',
          body: 'test',
        } as Post)

        expect(result).toEqual(2)
      })
    })
  })
})
