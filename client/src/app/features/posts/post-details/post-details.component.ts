import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { Store } from '@ngrx/store'
import { Post } from '../../../utils/interfaces/post.interface'
import {
  clearCurrentPost,
  deletePost,
  editPost,
  loadCurrentPost,
  togglePostLike,
} from '../../../store/posts/posts.actions'
import {
  selectCurrentPost,
  selectIsLikingPost,
} from '../../../store/posts/posts.selectors'
import { CommonModule, NgIf } from '@angular/common'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { User } from '../../../utils/interfaces/user.interface'
import { ImagePreloadDirective } from '../../../shared/directives/image-preload/image-preload.directive'
import {
  combineLatest,
  filter,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs'
import { ModalWrapperComponent } from '../../../shared/modal-wrapper/modal-wrapper.component'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { ClickOutsideDirective } from '../../../shared/directives/click-outside/click-outside.directive'
import { CommentIconComponent } from '../../../shared/icons/comment-icon/comment-icon.component'
import { LikeIconComponent } from '../../../shared/icons/like-icon/like-icon.component'
import { CommentCardComponent } from '../comments/comment-card/comment-card.component'
import { timeAgo } from '../../../utils/time-ago'
import { CreateCommentFormComponent } from '../comments/create-comment-form/create-comment-form.component'
import {
  selectCommentsForPost,
  selectLoadingComments,
} from '../../../store/comments/comments.selectors'
import { Comment } from '../../../utils/interfaces/comment.interface'
import { LoadingComponent } from '../../../shared/loading/loading.component'

@Component({
  selector: 'post-details',
  imports: [
    NgIf,
    RouterLink,
    ImagePreloadDirective,
    CommonModule,
    ModalWrapperComponent,
    ReactiveFormsModule,
    ClickOutsideDirective,
    CommentIconComponent,
    LikeIconComponent,
    CommentCardComponent,
    CreateCommentFormComponent,
    LoadingComponent,
  ],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.scss',
})
export class PostDetailsComponent implements OnInit, OnDestroy {
  post$: Observable<Post | null> = new Observable()
  comments$: Observable<Comment[]> = new Observable()
  currentUser$: Observable<User | null> = new Observable()
  isLiking$: Observable<boolean> = of(false)
  loadingComments$ = new Observable<boolean>()
  optionsVisible = false
  confirmationVisible = false
  editVisible = false
  private fb: FormBuilder = new FormBuilder()
  timeAgo = timeAgo

  editForm = this.fb.group({
    body: [''],
  })

  @ViewChild('textarea')
  set textarea(el: ElementRef<HTMLTextAreaElement> | undefined) {
    if (!el) return

    const textarea = el.nativeElement

    const resize = () => {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }

    resize()
    textarea.addEventListener('input', resize)
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit() {
    const postId = this.activatedRoute.snapshot.paramMap.get('postId')

    if (!postId) {
      this.router.navigate(['/404'])
      return
    }

    this.post$ = this.store.select(selectCurrentPost)
    this.currentUser$ = this.store.select(selectCurrentUser)
    this.comments$ = this.store.select(selectCommentsForPost(postId))
    this.loadingComments$ = this.store.select(selectLoadingComments)

    this.isLiking$ = this.post$.pipe(
      filter((post): post is Post => !!post),
      tap((post) => {
        this.editForm.patchValue({ body: post.body })
      }),
      switchMap((post) => this.store.select(selectIsLikingPost(post.id)))
    )
    this.isLiking$.pipe(take(1)).subscribe()

    this.store.dispatch(loadCurrentPost({ id: postId }))
  }

  formatDate(isoDate: string) {
    const date = new Date(isoDate)

    return date.toLocaleString()
  }

  showOptions = () => (this.optionsVisible = true)
  closeOptions = () => (this.optionsVisible = false)

  showConfirmation = () => (this.confirmationVisible = true)
  closeConfirmation = () => (this.confirmationVisible = false)

  showEdit = () => (this.editVisible = true)
  closeEdit = () => (this.editVisible = false)

  deletePost() {
    this.post$.pipe(take(1)).subscribe((post) => {
      if (!post) return

      this.store.dispatch(deletePost({ post: post }))
      this.router.navigate(['/'])
    })
  }

  editPost() {
    this.post$.pipe(take(1)).subscribe((post) => {
      if (!post) return

      const body = this.editForm.get('body')?.value!

      if (!post.image && !body) {
        this.showConfirmation()
        return
      }

      this.store.dispatch(editPost({ id: post.id, body, prevBody: post.body }))
      this.closeEdit()
      this.closeOptions()
    })
  }

  toggleLike() {
    combineLatest([this.post$, this.isLiking$, this.currentUser$])
      .pipe(take(1))
      .subscribe(([post, isLiking, currentUser]) => {
        if (!post || isLiking || !currentUser) return

        this.store.dispatch(togglePostLike({ postId: post.id }))
      })
  }

  ngOnDestroy() {
    this.store.dispatch(clearCurrentPost())
  }
}
