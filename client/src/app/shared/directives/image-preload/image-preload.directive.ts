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

  DEFAULT_POST_IMG =
    'https://res.cloudinary.com/dzg5ek6qa/image/upload/v1771202006/default_placeholder_al9lhb.png'

  updateUrl = () => {
    switch (this.default) {
      case 'profile':
        this.src = this.DEFAULT_PROFILE_IMG
        break
      case 'post':
        this.src = this.DEFAULT_POST_IMG
        break
      default:
        return
    }
  }
  load = () => (this.className = 'image-loaded')
}
