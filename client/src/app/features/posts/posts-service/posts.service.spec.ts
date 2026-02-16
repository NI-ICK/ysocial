import { flush, TestBed } from '@angular/core/testing'

import { PostsService } from './posts.service'
import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing'
import { Post } from '../../../utils/post.interface'
import { CREATE_POST, GET_ALL_POSTS } from '../../../graphql/post.operations'

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
    it('should return created post', () => {
      service.createPost('1', 'test', null).subscribe((result) => {
        expect(result.data?.createPost).toEqual(postMock)
      })

      const op = apolloController.expectOne(CREATE_POST)
      op.flush({ data: { createPost: postMock } })
      apolloController.verify()
    })
  })
})
