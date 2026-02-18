import { Observable, of, throwError } from 'rxjs'
import { PostsEffects } from '../posts.effects'
import { provideMockActions } from '@ngrx/effects/testing'
import { PopupService } from '../../../shared/popup/popup.service'
import { TestBed } from '@angular/core/testing'
import { Post } from '../../../utils/post.interface'
import * as PostsActions from '../posts.actions'
import { PostsService } from '../../../features/posts/posts-service/posts.service'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { selectCurrentUser } from '../../auth/auth.selectors'
import { User } from '../../../utils/user.interface'

describe('Posts Effects', () => {
  let actions$: Observable<any>
  let effects: PostsEffects
  let store: MockStore
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
    postsService = {
      getAllPosts: jest.fn(),
      createPost: jest.fn(),
    }

    TestBed.configureTestingModule({
      providers: [
        PostsEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: PopupService, useValue: popupService },
        { provide: PostsService, useValue: postsService },
      ],
    })
    effects = TestBed.inject(PostsEffects)
    store = TestBed.inject(MockStore)
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
      ;(postsService.getAllPosts as jest.Mock).mockReturnValue(
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
    it('should dispatch createPostSuccess and and replaceOptimisticPost then call popupService when postsService.createPost succeeds', () => {
      store.overrideSelector(selectCurrentUser, { id: '1' } as User)
      ;(postsService.createPost as jest.Mock).mockReturnValue(postMock)

      actions$ = of(
        PostsActions.createPost({
          body: 'test',
          file: null,
        })
      )

      const { id: _, ...postMocktWithoutId } = postMock

      effects.createPost$.subscribe((actions) => {
        expect(actions).toEqual([
          PostsActions.createPostSuccess({
            post: { id: 'tmp-1', ...postMocktWithoutId },
          }),
          PostsActions.replaceOptimisticPost({
            tmpId: 'tmp-1',
            post: postMock,
          }),
        ])
        expect(popupService.showPopup).toHaveBeenCalled()
      })
    })

    it('should dispatch createPostFailure and removeOptimisticPost when postsService.createPost fails', () => {
      store.overrideSelector(selectCurrentUser, { id: '1' } as User)
      ;(postsService.createPost as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(
        PostsActions.createPost({
          body: 'test',
          file: null,
        })
      )

      effects.createPost$.subscribe((actions) => {
        expect(actions).toEqual([
          PostsActions.removeOptimisticPost({ tmpId: 'tmp-1' }),
          PostsActions.createPostFailure({ error: 'test error' }),
        ])
      })
    })

    it('should dispatch createPostFailure if no user logged in', () => {
      store.overrideSelector(selectCurrentUser, null)

      actions$ = of(PostsActions.createPost({ body: 'test', file: null }))

      effects.createPost$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.createPostFailure({ error: 'No user logged in' })
        )
      })
    })
  })
})
