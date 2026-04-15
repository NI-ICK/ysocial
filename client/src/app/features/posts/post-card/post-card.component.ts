import { Component, Input, OnInit } from '@angular/core'
import { Post } from '../../../utils/interfaces/post.interface'
import { RouterLink } from '@angular/router'
import { CommonModule } from '@angular/common'
import { ImagePreloadDirective } from '../../../shared/directives/image-preload/image-preload.directive'
import { LikeIconComponent } from '../../../shared/icons/like-icon/like-icon.component'
import { CommentIconComponent } from '../../../shared/icons/comment-icon/comment-icon.component'
import { Store } from '@ngrx/store'
import { togglePostLike } from '../../../store/posts/posts.actions'
import { selectIsLikingPost } from '../../../store/posts/posts.selectors'
import { User } from '../../../utils/interfaces/user.interface'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { UiStateService } from '../../../shared/services/ui-state-service/ui-state.service'
import { combineLatest, Observable, of, take } from 'rxjs'
import { timeAgo } from '../../../utils/time-ago'

@Component({
  selector: 'post-card',
  imports: [
    RouterLink,
    CommonModule,
    ImagePreloadDirective,
    LikeIconComponent,
    CommentIconComponent,
  ],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
})
export class PostCardComponent implements OnInit {
  @Input() post!: Post
  currentUser$: Observable<User | null> = new Observable()
  isLiking$: Observable<boolean> = of(false)
  timeAgo = timeAgo

  constructor(private store: Store, private uiStateService: UiStateService) {}

  ngOnInit() {
    this.isLiking$ = this.store.select(selectIsLikingPost(this.post.id))
    this.currentUser$ = this.store.select(selectCurrentUser)
  }

  handleExpand() {
    this.uiStateService.setExpandedPost(this.post.id)
  }

  isExpanded() {
    return this.uiStateService.isPostExpanded(this.post.id)
  }

  toggleLike() {
    combineLatest([this.isLiking$, this.currentUser$])
      .pipe(take(1))
      .subscribe(([isLiking, currentUser]) => {
        if (isLiking || !currentUser) return

        this.store.dispatch(togglePostLike({ postId: this.post.id }))
      })
  }
}
