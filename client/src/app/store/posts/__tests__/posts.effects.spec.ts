import { Observable, of, take, throwError, toArray } from 'rxjs'
import { PostsEffects } from '../posts.effects'
import { provideMockActions } from '@ngrx/effects/testing'
import { PopupService } from '../../../shared/popup/popup.service'
import { TestBed } from '@angular/core/testing'
import { Post } from '../../../utils/interfaces/post.interface'
import * as PostsActions from '../posts.actions'
import { PostsService } from '../../../features/posts/posts-service/posts.service'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { selectCurrentUser } from '../../auth/auth.selectors'
import { User } from '../../../utils/interfaces/user.interface'
import { Actions } from '@ngrx/effects'
import { Router, RouterModule } from '@angular/router'

describe('Posts Effects', () => {
  let actions$: Actions
  let effects: PostsEffects
  let store: MockStore
  let popupService: Partial<PopupService>
  let postsService: Partial<PostsService>
  let router: Router

  const postMock = {
    id: '1',
    body: 'test',
    image: null,
    createdAt: new Date().toISOString(),
    user: { username: 'test' },
  } as Post

  beforeEach(() => {
    popupService = {
      showPopup: jest.fn(),
    }
    postsService = {
      getPosts: jest.fn(),
      createPost: jest.fn(),
      getPostById: jest.fn(),
      deletePost: jest.fn(),
      editPost: jest.fn(),
      togglePostLike: jest.fn(),
    }

    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
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
    router = TestBed.inject(Router)
  })

  describe('loadPosts', () => {
    it('should dispatch loadPostsSuccess when postsService.getPosts succeeds', (done) => {
      ;(postsService.getPosts as jest.Mock).mockReturnValue(
        of({ data: { getPosts: [postMock] } })
      )

      actions$ = of(PostsActions.loadPosts({ offset: 0 }))

      effects.loadPosts$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.loadPostsSuccess({ posts: [postMock] })
        )
        done()
      })
    })

    it('should dispatch loadPostsFailure when postsService.getPosts fails', (done) => {
      ;(postsService.getPosts as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )
      actions$ = of(PostsActions.loadPosts({ offset: 0 }))

      effects.loadPosts$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.loadPostsFailure({ error: 'test error' })
        )
        done()
      })
    })
  })

  describe('createPost', () => {
    it('should dispatch createPostSuccess and replaceOptimisticPost then call popupService when postsService.createPost succeeds', (done) => {
      store.overrideSelector(selectCurrentUser, { id: '1' } as User)
      ;(postsService.createPost as jest.Mock).mockReturnValue(
        of({ data: { createPost: postMock } })
      )

      actions$ = of(
        PostsActions.createPost({
          body: 'test',
          file: null,
        })
      )

      effects.createPost$.pipe(toArray()).subscribe((actions) => {
        const optimistic = actions[0] as ReturnType<
          typeof PostsActions.createPostSuccess
        >
        const replace = actions[1] as ReturnType<
          typeof PostsActions.removeOptimisticPost
        >

        expect(optimistic.type).toEqual('[Posts] Create Post Success')
        expect(optimistic.post).toEqual(
          expect.objectContaining({
            body: 'test',
            image: null,
            id: expect.stringMatching(/^tmp-/),
          })
        )

        expect(replace.type).toEqual('[Posts] Replace Optimistic Post')
        expect(replace).toEqual(
          PostsActions.replaceOptimisticPost({
            tmpId: optimistic.post.id,
            post: postMock,
          })
        )

        expect(popupService.showPopup).toHaveBeenCalled()

        done()
      })
    })

    it('should dispatch createPostFailure and removeOptimisticPost when postsService.createPost fails', (done) => {
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

      effects.createPost$.pipe(toArray()).subscribe((actions) => {
        const optimistic = actions[0] as ReturnType<
          typeof PostsActions.createPostSuccess
        >
        const remove = actions[1] as ReturnType<
          typeof PostsActions.removeOptimisticPost
        >
        const createFailure = actions[2] as ReturnType<
          typeof PostsActions.createPostFailure
        >

        expect(optimistic.type).toEqual('[Posts] Create Post Success')
        expect(optimistic.post.body).toEqual('test')
        expect(optimistic.post.image).toEqual(null)

        expect(remove.type).toEqual('[Posts] Remove Optimistic Post')
        expect(remove.tmpId).toMatch(/^tmp-/)

        expect(createFailure.type).toEqual('[Posts] Create Post Failure')
        expect(createFailure.error).toEqual('test error')

        done()
      })
    })

    it('should dispatch createPostFailure if no user logged in', (done) => {
      store.overrideSelector(selectCurrentUser, null)

      actions$ = of(PostsActions.createPost({ body: 'test', file: null }))

      effects.createPost$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.createPostFailure({ error: 'No user logged in' })
        )
        done()
      })
    })
  })

  describe('loadCurrentPost', () => {
    it('should dispatch loadCurrentPostSuccess when postsService.getPostById succeeds', (done) => {
      ;(postsService.getPostById as jest.Mock).mockReturnValue(
        of({
          data: {
            getPostById: postMock,
          },
        })
      )

      actions$ = of(
        PostsActions.loadCurrentPost({ id: '1', usernameParam: 'test' })
      )

      effects.loadCurrentPost$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.loadCurrentPostSuccess({ post: postMock })
        )
        done()
      })
    })

    it('should dispatch loadCurrentPostFailure when postsService.getPostById fails', (done) => {
      ;(postsService.getPostById as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(
        PostsActions.loadCurrentPost({ id: '1', usernameParam: 'test' })
      )

      effects.loadCurrentPost$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.loadCurrentPostFailure({ error: 'test error' })
        )
        done()
      })
    })

    it('should dispatch loadCurrentPostFailure when post is null', (done) => {
      ;(postsService.getPostById as jest.Mock).mockReturnValue(
        of({
          data: {
            getPostById: null,
          },
        })
      )

      actions$ = of(
        PostsActions.loadCurrentPost({ id: '1', usernameParam: 'test' })
      )

      effects.loadCurrentPost$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.loadCurrentPostFailure({ error: 'Failed to load post' })
        )
        done()
      })
    })

    it('should dispatch loadCurrentPostFailure when usernames do not match', (done) => {
      ;(postsService.getPostById as jest.Mock).mockReturnValue(
        of({
          data: {
            getPostById: postMock,
          },
        })
      )

      actions$ = of(
        PostsActions.loadCurrentPost({ id: '1', usernameParam: 'test1' })
      )

      effects.loadCurrentPost$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.loadCurrentPostFailure({
            error: 'Username does not match',
          })
        )
        done()
      })
    })

    describe('loadCurrentPostFailure', () => {
      it('should navigate to not-found page', (done) => {
        const navigateSpy = jest.spyOn(router, 'navigate')

        actions$ = of(PostsActions.loadCurrentPostFailure({ error: 'test' }))

        effects.loadCurrentPostFailure$.pipe(take(1)).subscribe(() => {
          expect(navigateSpy).toHaveBeenCalledWith(['/not-found'])
          done()
        })
      })
    })
  })

  describe('deletePost', () => {
    it('should dispatch deletePostSuccess when postsService.deletePost succeeds', (done) => {
      ;(postsService.deletePost as jest.Mock).mockReturnValue(
        of({ data: { deletePost: { success: true, message: 'test' } } })
      )

      actions$ = of(PostsActions.deletePost({ post: postMock }))

      effects.deletePost$.subscribe((action) => {
        expect(action).toEqual(PostsActions.deletePostSuccess())
      })
      done()
    })

    it('should dispatch deletePostFailure when postsService.deletePost fails', (done) => {
      ;(postsService.deletePost as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(PostsActions.deletePost({ post: postMock }))

      effects.deletePost$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.deletePostFailure({
            error: 'test error',
            post: postMock,
          })
        )
        done()
      })
    })

    describe('deletePostSuccess', () => {
      it('should call popupService', (done) => {
        actions$ = of(PostsActions.deletePostSuccess())

        effects.deletePostSuccess$.subscribe(() => {
          expect(popupService.showPopup).toHaveBeenCalledWith(
            'Post Deleted Successfully'
          )
          done()
        })
      })
    })

    describe('deletePostFailure', () => {
      it('should call popupService', (done) => {
        actions$ = of(
          PostsActions.deletePostFailure({
            error: 'test error',
            post: postMock,
          })
        )

        effects.deletePostFailure$.subscribe(() => {
          expect(popupService.showPopup).toHaveBeenCalledWith(
            'Failed to Delete Post'
          )
          done()
        })
      })
    })
  })

  describe('editPost', () => {
    it('should dispatch editPostSuccess when postsService.editPost succeeds', (done) => {
      ;(postsService.editPost as jest.Mock).mockReturnValue(
        of({ data: { editPost: postMock } })
      )

      actions$ = of(
        PostsActions.editPost({ id: '1', body: 'test2', prevBody: 'test' })
      )

      effects.editPost$.subscribe((action) => {
        expect(action).toEqual(PostsActions.editPostSuccess({ post: postMock }))
        done()
      })
    })

    it('should dispatch editPostFailure when postsService.editPost fails', (done) => {
      ;(postsService.editPost as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(
        PostsActions.editPost({ id: '1', body: 'test2', prevBody: 'test' })
      )

      effects.editPost$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.editPostFailure({
            error: 'test error',
            id: '1',
            prevBody: 'test',
          })
        )
        done()
      })
    })

    describe('editPostSuccess', () => {
      it('should call popupService', (done) => {
        actions$ = of(PostsActions.editPostSuccess({ post: postMock }))

        effects.editPostSuccess$.subscribe(() => {
          expect(popupService.showPopup).toHaveBeenCalledWith(
            'Post Edited Successfully'
          )
          done()
        })
      })
    })

    describe('editPostFailure', () => {
      it('should call popupService', (done) => {
        actions$ = of(
          PostsActions.editPostFailure({
            error: 'test error',
            id: '1',
            prevBody: 'test',
          })
        )

        effects.editPostFailure$.subscribe(() => {
          expect(popupService.showPopup).toHaveBeenCalledWith(
            'Failed to Edit Post'
          )
          done()
        })
      })
    })
  })

  describe('togglePostLike', () => {
    it('should dispatch togglePostLikeSuccess when postsService.togglePostLike succeeds', (done) => {
      ;(postsService.togglePostLike as jest.Mock).mockReturnValue(
        of({ data: { togglePostLike: { addLike: true } } })
      )

      actions$ = of(PostsActions.togglePostLike({ postId: '1' }))

      effects.togglePostLike$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.togglePostLikeSuccess({ postId: '1' })
        )
        done()
      })
    })

    it('should dispatch togglePostLikeFailure when postsService.togglePostLike fails', (done) => {
      ;(postsService.togglePostLike as jest.Mock).mockReturnValue(
        throwError(() => new Error('test error'))
      )

      actions$ = of(PostsActions.togglePostLike({ postId: '1' }))

      effects.togglePostLike$.subscribe((action) => {
        expect(action).toEqual(
          PostsActions.togglePostLikeFailure({ error: 'test error' })
        )
        done()
      })
    })
  })
})
