import { Component, Input } from '@angular/core'
import { Post } from '../../../utils/post.interface'
import { CommonModule } from '@angular/common'
import { ImagePreloadDirective } from '../../../shared/directives/image-preload/image-preload.directive'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'post-feed',
  imports: [CommonModule, ImagePreloadDirective, RouterLink],
  templateUrl: './post-feed.component.html',
  styleUrl: './post-feed.component.scss',
})
export class PostFeedComponent {
  @Input() posts: Post[] = []
}
