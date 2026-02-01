import { Directive, Input, HostBinding } from '@angular/core'

@Directive({
  selector: 'img[default]',
  host: {
    '(error)': 'updateUrl()',
    '(load)': 'load()',
    '[src]': 'src',
  },
})
export class ImagePreloadDirective {
  @Input() src!: string
  @Input() default!: string
  @HostBinding('class') className = 'img'

  DEFAULT_PROFILE_IMG =
    'https://res.cloudinary.com/dzg5ek6qa/image/upload/v1767444425/noPhoto_hwrr7w_x4wghr.webp'

  updateUrl = () => {
    if (this.default === 'profile') {
      this.src = this.DEFAULT_PROFILE_IMG
    }
  }
  load = () => (this.className = 'image-loaded')
}
