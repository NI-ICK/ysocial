import { Component, Input } from '@angular/core'
import { Post } from '../../../utils/post.interface'
import { RouterLink } from '@angular/router'
import { CommonModule } from '@angular/common'
import { ImagePreloadDirective } from '../../../shared/directives/image-preload/image-preload.directive'

@Component({
  selector: 'post-card',
  imports: [RouterLink, CommonModule, ImagePreloadDirective],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
})
export class PostCardComponent {
  @Input() post!: Post
  isBodyExpanded = false

  handleExpand = () => (this.isBodyExpanded = true)
}
