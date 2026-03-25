import { Component, Input, OnInit } from '@angular/core'
import { Post } from '../../../utils/post.interface'
import { RouterLink } from '@angular/router'
import { CommonModule } from '@angular/common'
import { ImagePreloadDirective } from '../../../shared/directives/image-preload/image-preload.directive'
import { LikeIconComponent } from '../../../shared/icons/like-icon/like-icon.component'
import { CommentIconComponent } from '../../../shared/icons/comment-icon/comment-icon.component'
import { Store } from '@ngrx/store'
import { togglePostLike } from '../../../store/posts/posts.actions'
import { selectIsLikingPost } from '../../../store/posts/posts.selectors'
import { User } from '../../../utils/user.interface'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { UiStateService } from '../../../shared/services/ui-state-service/ui-state.service'

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
  currentUser: User | null = null
  isLiking = false

  constructor(private store: Store, private uiStateService: UiStateService) {}

  ngOnInit() {
    this.store
      .select(selectIsLikingPost(this.post.id))
      .subscribe((liking) => (this.isLiking = liking))

    this.store
      .select(selectCurrentUser)
      .subscribe((user) => (this.currentUser = user))
  }

  handleExpand() {
    this.uiStateService.setExpanded(this.post.id)
  }

  isExpanded() {
    return this.uiStateService.isExpanded(this.post.id)
  }

  toggleLike() {
    if (this.isLiking || !this.currentUser) return

    this.store.dispatch(togglePostLike({ postId: this.post.id }))
  }
}
