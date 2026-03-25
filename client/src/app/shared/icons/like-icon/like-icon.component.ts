import { Component, Input } from '@angular/core'

@Component({
  selector: 'like-icon',
  imports: [],
  templateUrl: './like-icon.component.html',
  styleUrl: './like-icon.component.scss',
})
export class LikeIconComponent {
  @Input() isLiked = false
  color = '#a78afa'
}
