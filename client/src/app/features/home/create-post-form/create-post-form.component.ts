import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { User } from '../../../utils/user.interface'
import { ImageIconComponent } from '../../../shared/icons/image-icon/image-icon.component'
import { ImagePreloadDirective } from '../../../shared/directives/image-preload/image-preload.directive'
import { CommonModule, NgIf } from '@angular/common'
import { Observable } from 'rxjs'
import { Store } from '@ngrx/store'
import { createPost } from '../../../store/posts/posts.actions'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'

@Component({
  selector: 'create-post-form',
  imports: [
    ImageIconComponent,
    ReactiveFormsModule,
    ImagePreloadDirective,
    CommonModule,
    NgIf,
  ],
  templateUrl: './create-post-form.component.html',
  styleUrl: './create-post-form.component.scss',
})
export class CreatePostFormComponent implements OnInit {
  currentUser$!: Observable<User | null>
  fb = new FormBuilder()
  imageIconHovered = false
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>
  selectedFile: File | null = null
  imagePreview = ''

  createPostForm = this.fb.group({
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

  constructor(private store: Store) {}

  ngOnInit() {
    this.currentUser$ = this.store.select(selectCurrentUser)
  }

  handleChooseFile() {
    this.fileInput.nativeElement.click()
  }

  handleRemoveFile() {
    this.selectedFile = null
    this.imagePreview = ''
  }

  handleFileInputChange(e: Event) {
    const input = e.target as HTMLInputElement

    if (!input.files?.length) return

    this.selectedFile = input.files[0]

    const reader = new FileReader()
    reader.onload = () => (this.imagePreview = reader.result as string)
    reader.readAsDataURL(this.selectedFile)
  }

  handleFormSubmit() {
    const body = this.createPostForm.get('body')?.value

    if (!body && !this.selectedFile) return

    this.store.dispatch(
      createPost({ body: body || null, file: this.selectedFile })
    )

    this.createPostForm.reset()
    this.handleRemoveFile()
  }
}
