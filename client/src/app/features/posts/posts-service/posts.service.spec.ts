import { TestBed } from '@angular/core/testing'
import { PostsService } from './posts.service'
import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing'
import { Post } from '../../../utils/post.interface'
import {
  CREATE_POST,
  DELETE_POST,
  EDIT_POST,
  GET_ALL_POSTS,
  GET_POST_BY_ID,
} from '../../../graphql/post.operations'

describe('PostsServiceService', () => {
  let service: PostsService
  let apolloController: ApolloTestingController

  const postMock = {
    id: '1',
    body: 'test',
    image: null,
  } as Post

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ApolloTestingModule] })
    service = TestBed.inject(PostsService)
    apolloController = TestBed.inject(ApolloTestingController)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('getAllPosts', () => {
    it('should return array of posts', () => {
      service
        .getAllPosts()
        .subscribe((result) =>
          expect(result.data?.getAllPosts).toEqual([postMock])
        )

      const op = apolloController.expectOne(GET_ALL_POSTS)
      op.flush({ data: { getAllPosts: [postMock] } })
      apolloController.verify()
    })
  })

  describe('createPost', () => {
    it('should return created post with correct variables', () => {
      service.createPost('1', 'test', null).subscribe((result) => {
        expect(result.data?.createPost).toEqual(postMock)
      })

      const op = apolloController.expectOne(CREATE_POST)

      expect(op.operation.variables).toEqual({
        userId: '1',
        body: 'test',
        image: null,
      })

      op.flush({ data: { createPost: postMock } })
      apolloController.verify()
    })
  })

  describe('getPostById', () => {
    it('should return post with correct variables', () => {
      service.getPostById('1').subscribe((result) => {
        expect(result.data?.getPostById).toEqual(postMock)
      })

      const op = apolloController.expectOne(GET_POST_BY_ID)

      expect(op.operation.variables).toEqual({
        id: '1',
      })

      op.flush({ data: { getPostById: postMock } })
      apolloController.verify()
    })
  })

  describe('deletePost', () => {
    it('should return message with correct variables', () => {
      const deleteMock = { success: true, message: 'Test' }

      service.deletePost('1').subscribe((result) => {
        expect(result.data?.deletePost).toEqual(deleteMock)
      })

      const op = apolloController.expectOne(DELETE_POST)

      expect(op.operation.variables).toEqual({
        id: '1',
      })

      op.flush({ data: { deletePost: deleteMock } })
      apolloController.verify()
    })
  })

  describe('editPost', () => {
    it('should return edited post', () => {
      service.editPost('1', 'test').subscribe((result) => {
        expect(result.data?.editPost).toEqual(postMock)
      })

      const op = apolloController.expectOne(EDIT_POST)

      expect(op.operation.variables).toEqual({
        id: '1',
        body: 'test',
      })

      op.flush({ data: { editPost: postMock } })
      apolloController.verify()
    })
  })
})
