import { TestBed } from '@angular/core/testing'
import { UsersService } from './users.service'
import { Post } from '../../../utils/interfaces/post.interface'
import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing'
import {
  DELETE_USER,
  GET_FOLLOWERS_OF_USER,
  GET_FOLLOWING_OF_USER,
  GET_USER_BY_USERNAME,
  IS_EMAIL_TAKEN,
  IS_USERNAME_TAKEN,
  TOGGLE_FOLLOW,
  UPDATE_USER,
  UPDATE_USER_PROFILE_IMAGE,
} from '../../../graphql/users.operation'
import { User } from '../../../utils/interfaces/user.interface'
import {
  GET_POSTS_CREATED_BY_USER,
  GET_POSTS_LIKED_BY_USER,
} from '../../../graphql/post.operations'

describe('UsersService', () => {
  let service: UsersService
  let apolloController: ApolloTestingController

  const postMock = { id: '1', body: 'test' } as Post
  const userMock = { id: '5', username: 'test' } as User

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ApolloTestingModule] })
    service = TestBed.inject(UsersService)
    apolloController = TestBed.inject(ApolloTestingController)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('getUserByUsername', () => {
    it('should return user with correct variables', (done) => {
      service.getUserByUsername('test').subscribe((result) => {
        expect(result.data?.getUserByUsername).toEqual(userMock)
        done()
      })

      const op = apolloController.expectOne(GET_USER_BY_USERNAME)

      expect(op.operation.variables).toEqual({
        username: 'test',
      })

      op.flush({ data: { getUserByUsername: userMock } })
      apolloController.verify()
    })
  })

  describe('getPostsCreatedByUser', () => {
    it('should return created posts with correct variables', (done) => {
      service.getPostsCreatedByUser('123', 0).subscribe((result) => {
        expect(result.data?.getPostsCreatedByUser).toEqual(postMock)
        done()
      })

      const op = apolloController.expectOne(GET_POSTS_CREATED_BY_USER)

      expect(op.operation.variables).toEqual({
        userId: '123',
        offset: 0,
        limit: 5,
      })

      op.flush({ data: { getPostsCreatedByUser: postMock } })
      apolloController.verify()
    })
  })

  describe('getPostsLikedByUser', () => {
    it('should return liked posts with correct variables', (done) => {
      service.getPostsLikedByUser('123', 0).subscribe((result) => {
        expect(result.data?.getPostsLikedByUser).toEqual(postMock)
        done()
      })

      const op = apolloController.expectOne(GET_POSTS_LIKED_BY_USER)

      expect(op.operation.variables).toEqual({
        userId: '123',
        offset: 0,
        limit: 5,
      })

      op.flush({ data: { getPostsLikedByUser: postMock } })
      apolloController.verify()
    })
  })

  describe('toggleFollow', () => {
    it('should return response with correct variables', (done) => {
      service.toggleFollow('123').subscribe((result) => {
        expect(result.data?.toggleFollow).toEqual({ followed: true })
        done()
      })

      const op = apolloController.expectOne(TOGGLE_FOLLOW)

      expect(op.operation.variables).toEqual({
        userId: '123',
      })

      op.flush({ data: { toggleFollow: { followed: true } } })
      apolloController.verify()
    })
  })

  describe('getFollowersOfUser', () => {
    it('should return followers with correct variables', (done) => {
      service.getFollowersOfUser('test', 0).subscribe((result) => {
        expect(result.data?.getFollowersOfUser).toEqual([userMock])
        done()
      })

      const op = apolloController.expectOne(GET_FOLLOWERS_OF_USER)

      expect(op.operation.variables).toEqual({
        username: 'test',
        offset: 0,
        limit: 5,
      })

      op.flush({ data: { getFollowersOfUser: [userMock] } })
      apolloController.verify()
    })
  })

  describe('getFollowingOfUser', () => {
    it('should return following with correct variables', (done) => {
      service.getFollowingOfUser('test', 0).subscribe((result) => {
        expect(result.data?.getFollowingOfUser).toEqual([userMock])
        done()
      })

      const op = apolloController.expectOne(GET_FOLLOWING_OF_USER)

      expect(op.operation.variables).toEqual({
        username: 'test',
        offset: 0,
        limit: 5,
      })

      op.flush({ data: { getFollowingOfUser: [userMock] } })
      apolloController.verify()
    })
  })

  describe('deleteUser', () => {
    it('should return response', (done) => {
      service.deleteUser().subscribe((result) => {
        expect(result.data?.deleteUser).toEqual({
          success: true,
          messsage: 'test',
        })
        done()
      })

      const op = apolloController.expectOne(DELETE_USER)
      op.flush({ data: { deleteUser: { success: true, messsage: 'test' } } })
      apolloController.verify()
    })
  })

  describe('updateUser', () => {
    it('should return user with correct variables', (done) => {
      service
        .updateUser({ newUsername: 'test', newEmail: 'test@test' })
        .subscribe((result) => {
          expect(result.data?.updateUser).toEqual(userMock)
          done()
        })

      const op = apolloController.expectOne(UPDATE_USER)

      expect(op.operation.variables).toEqual({
        newUsername: 'test',
        newEmail: 'test@test',
      })

      op.flush({ data: { updateUser: userMock } })
      apolloController.verify()
    })
  })

  describe('isUsernameTaken', () => {
    it('should return response', (done) => {
      service.isUsernameTaken('test').subscribe((result) => {
        expect(result.data?.isUsernameTaken).toEqual(true)
        done()
      })

      const op = apolloController.expectOne(IS_USERNAME_TAKEN)

      expect(op.operation.variables).toEqual({
        username: 'test',
      })

      op.flush({ data: { isUsernameTaken: true } })
      apolloController.verify()
    })
  })

  describe('isEmailTaken', () => {
    it('should return response', (done) => {
      service.isEmailTaken('test@test').subscribe((result) => {
        expect(result.data?.isEmailTaken).toEqual(true)
        done()
      })

      const op = apolloController.expectOne(IS_EMAIL_TAKEN)

      expect(op.operation.variables).toEqual({
        email: 'test@test',
      })

      op.flush({ data: { isEmailTaken: true } })
      apolloController.verify()
    })
  })

  describe('updateUserProfileImage', () => {
    it('should return user with correct variables', (done) => {
      const fileMock = new File(['content'], 'file')

      service.updateUserProfileImage(fileMock).subscribe((result) => {
        expect(result.data?.updateUserProfileImage).toEqual(userMock)
        done()
      })

      const op = apolloController.expectOne(UPDATE_USER_PROFILE_IMAGE)

      expect(op.operation.variables).toEqual({
        image: fileMock,
      })

      op.flush({ data: { updateUserProfileImage: userMock } })
      apolloController.verify()
    })
  })
})
