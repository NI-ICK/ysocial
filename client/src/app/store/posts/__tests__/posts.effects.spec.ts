import { Observable, of, throwError } from 'rxjs'
import { PostsEffects } from '../posts.effects'
import { provideMockActions } from '@ngrx/effects/testing'
import { AuthService } from '../../../features/auth/auth-service/auth.service'
import { PopupService } from '../../../shared/popup/popup.service'
import { TestBed } from '@angular/core/testing'
import { Post } from '../../../utils/post.interface'
import * as PostsActions from '../posts.actions'
import { PostsService } from '../../../features/posts/posts-service/posts.service'

describe('Posts Effects', () => {
  let actions$: Observable<any>
  let effects: PostsEffects
  let authService: Partial<AuthService>
  let popupService: Partial<PopupService>
  let postsService: Partial<PostsService>

  const postMock = {
    id: '1',
    body: 'test',
    image: null,
    createdAt: new Date(),
  } as Post

  beforeEach(() => {
    popupService = {
      showPopup: jest.fn(),
    }
    authService = {
      getCurrentUser: jest.fn(),
    }
    postsService = {
      getAllPosts: jest.fn(),
      createPost: jest.fn(),
    }

    TestBed.configureTestingModule({
      providers: [
        PostsEffects,
        provideMockActions(() => actions$),
        { provide: AuthService, useValue: authService },
        { provide: PopupService, useValue: popupService },
        { provide: PostsService, useValue: postsService },
      ],
    })
    effects = TestBed.inject(PostsEffects)
  })

  describe('loadPosts', () => {
    it('should dispatch loadPostsSuccess when postsService.getAllPosts succeeds', () => {
      ;(postsService.getAllPosts as jest.Mock).mockReturnValue(
        of({ getAllPosts: [postMock] })
      )

      actions$ = of(PostsActions.loadPosts())

      effects.loadPosts$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.loadPostsSuccess({ posts: [postMock] })
        )
      })
    })

    it('should dispatch loadPostsFailure when postsService.getAllPosts fails', () => {
      ;(postsService.getAllPosts as jest.Mock).mockReturnValue(() =>
        throwError(() => new Error('test error'))
      )
      actions$ = of(PostsActions.loadPosts())

      effects.loadPosts$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.loadPostsFailure({ error: 'test error' })
        )
      })
    })
  })

  describe('createPost', () => {
    it('should dispatch createPostSuccess and call popupService when postsService.createPost succeeds', () => {
      ;(authService.getCurrentUser as jest.Mock).mockReturnValue(
        of({ id: '1' })
      )
      ;(postsService.createPost as jest.Mock).mockReturnValue(postMock)

      actions$ = of(
        PostsActions.createPost({
          body: 'test',
          file: null,
        })
      )

      effects.createPost$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.createPostSuccess({ post: postMock })
        )
        expect(popupService.showPopup).toHaveBeenCalled()
      })
    })

    it('should dispatch createPostFailure when CREATE_POST fails', () => {
      ;(authService.getCurrentUser as jest.Mock).mockReturnValue(
        of({ id: '1' })
      )
      ;(postsService.createPost as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(PostsActions.createPost({ body: 'test', file: null }))

      effects.createPost$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.createPostFailure({ error: 'test error' })
        )
      })
    })
  })
})
