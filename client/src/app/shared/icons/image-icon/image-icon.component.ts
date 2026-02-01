import { Component, Input } from '@angular/core'

@Component({
  selector: 'image-icon',
  imports: [],
  templateUrl: './image-icon.component.html',
  styleUrl: './image-icon.component.scss',
})
export class ImageIconComponent {
  @Input() color = '#a78afa'
}
