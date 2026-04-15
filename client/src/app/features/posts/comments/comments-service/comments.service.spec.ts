import { TestBed } from '@angular/core/testing'
import { CommentsService } from './comments.service'
import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing'
import {
  CREATE_COMMENT,
  GET_COMMENTS_BY_POST_ID,
  TOGGLE_COMMENT_LIKE,
} from '../../../../graphql/comment.operations'

describe('CommentsService', () => {
  let service: CommentsService
  let apolloController: ApolloTestingController

  const commentMock = {
    id: '1',
    body: 'test',
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ApolloTestingModule] })
    service = TestBed.inject(CommentsService)
    apolloController = TestBed.inject(ApolloTestingController)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('getCommentsByPostId', () => {
    it('should return comments array with correct variables', (done) => {
      service.getCommentsByPostId('1').subscribe((result) => {
        expect(result.data?.getCommentsByPostId).toEqual([commentMock])
        done()
      })

      const op = apolloController.expectOne(GET_COMMENTS_BY_POST_ID)

      expect(op.operation.variables).toEqual({
        id: '1',
      })

      op.flush({ data: { getCommentsByPostId: [commentMock] } })
      apolloController.verify()
    })
  })

  describe('createComment', () => {
    it('should return created comment with correct variables', (done) => {
      service.createComment('test', '1', null).subscribe((result) => {
        expect(result.data?.createComment).toEqual(commentMock)
        done()
      })

      const op = apolloController.expectOne(CREATE_COMMENT)

      expect(op.operation.variables).toEqual({
        body: 'test',
        postId: '1',
        parentId: null,
      })

      op.flush({ data: { createComment: commentMock } })
      apolloController.verify()
    })
  })

  describe('toggleCommentLike', () => {
    it('should return response with correct variables', (done) => {
      service.toggleCommentLike('1').subscribe((result) => {
        expect(result.data?.toggleCommentLike).toEqual({ addLike: true })
        done()
      })

      const op = apolloController.expectOne(TOGGLE_COMMENT_LIKE)

      expect(op.operation.variables).toEqual({
        commentId: '1',
      })

      op.flush({ data: { toggleCommentLike: { addLike: true } } })
      apolloController.verify()
    })
  })
})
