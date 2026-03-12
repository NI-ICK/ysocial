import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { Store } from '@ngrx/store'
import { Post } from '../../../utils/post.interface'
import {
  clearCurrentPost,
  deletePost,
  editPost,
  loadCurrentPost,
} from '../../../store/posts/posts.actions'
import { selectCurrentPost } from '../../../store/posts/posts.selectors'
import { CommonModule, NgIf } from '@angular/common'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { User } from '../../../utils/user.interface'
import { ImagePreloadDirective } from '../../../shared/directives/image-preload/image-preload.directive'
import { filter, Observable, take } from 'rxjs'
import { ModalWrapperComponent } from '../../../shared/modal-wrapper/modal-wrapper.component'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { ClickOutsideDirective } from '../../../shared/directives/click-outside/click-outside.directive'

@Component({
  selector: 'app-post-details',
  imports: [
    NgIf,
    RouterLink,
    ImagePreloadDirective,
    CommonModule,
    ModalWrapperComponent,
    ReactiveFormsModule,
    ClickOutsideDirective,
  ],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.scss',
})
export class PostDetailsComponent implements OnInit, OnDestroy {
  post$: Observable<Post | null> = new Observable()
  currentUser$: Observable<User | null> = new Observable()
  optionsVisible = false
  confirmationVisible = false
  editVisible = false
  private fb: FormBuilder = new FormBuilder()

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

  ngOnInit(): void {
    const postId = this.activatedRoute.snapshot.paramMap.get('postId')

    if (!postId) {
      this.router.navigate(['/404'])
      return
    }

    this.post$ = this.store.select(selectCurrentPost)
    this.currentUser$ = this.store.select(selectCurrentUser)

    this.post$
      .pipe(
        filter((post): post is Post => !!post),
        take(1)
      )
      .subscribe((post) => {
        this.editForm.patchValue({ body: post.body })
      })

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

  ngOnDestroy(): void {
    this.store.dispatch(clearCurrentPost())
  }
}
