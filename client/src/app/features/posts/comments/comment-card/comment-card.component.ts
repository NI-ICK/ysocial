import { Component, Input, OnInit } from '@angular/core'
import { Comment } from '../../../../utils/interfaces/comment.interface'
import { RouterLink } from '@angular/router'
import { timeAgo } from '../../../../utils/time-ago'
import { CommentIconComponent } from '../../../../shared/icons/comment-icon/comment-icon.component'
import { LikeIconComponent } from '../../../../shared/icons/like-icon/like-icon.component'
import { combineLatest, Observable, of, take } from 'rxjs'
import { User } from '../../../../utils/interfaces/user.interface'
import { Store } from '@ngrx/store'
import { selectCurrentUser } from '../../../../store/auth/auth.selectors'
import { CommonModule, NgIf } from '@angular/common'
import {
  selectIsLikingComment,
  selectRepliesForComment,
} from '../../../../store/comments/comments.selectors'
import {
  createComment,
  toggleCommentLike,
} from '../../../../store/comments/comments.actions'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { UiStateService } from '../../../../shared/services/ui-state-service/ui-state.service'

@Component({
  selector: 'comment-card',
  imports: [
    RouterLink,
    CommentIconComponent,
    LikeIconComponent,
    NgIf,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './comment-card.component.html',
  styleUrl: './comment-card.component.scss',
})
export class CommentCardComponent implements OnInit {
  @Input() comment!: Comment
  @Input() postId!: string
  timeAgo = timeAgo
  replies$: Observable<Comment[]> = new Observable()
  currentUser$: Observable<User | null> = new Observable()
  isLiking$: Observable<boolean> = of(false)
  isReplyFormVisible = false
  fb = new FormBuilder()
  createReplyForm = this.fb.group({
    body: [''],
  })

  constructor(private store: Store, private uiStateService: UiStateService) {}

  ngOnInit() {
    this.isLiking$ = this.store.select(selectIsLikingComment(this.comment.id))
    this.currentUser$ = this.store.select(selectCurrentUser)
    this.replies$ = this.store.select(selectRepliesForComment(this.comment.id))
  }

  expandReplies() {
    this.uiStateService.expandReplies(this.comment.id)
  }

  collapseReplies() {
    this.uiStateService.collapseReplies(this.comment.id)
  }

  areRepliesExpanded() {
    return this.uiStateService.areRepliesExpanded(this.comment.id)
  }

  handleFormSubmit() {
    const body = this.createReplyForm.get('body')?.value

    if (!body) return

    this.store.dispatch(
      createComment({
        body,
        postId: this.postId,
        parentId: this.comment.id,
      })
    )
    this.createReplyForm.reset()
    this.expandReplies()
  }

  toggleLike() {
    combineLatest([this.isLiking$, this.currentUser$])
      .pipe(take(1))
      .subscribe(([isLiking, currentUser]) => {
        if (isLiking || !currentUser) return

        this.store.dispatch(toggleCommentLike({ commentId: this.comment.id }))
      })
  }
}
