import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { User } from '../../../utils/interfaces/user.interface'
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
  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>
  selectedFile: File | null = null
  imagePreview = ''

  createPostForm = this.fb.group({
    body: [''],
  })

  constructor(private store: Store) {}

  ngOnInit() {
    this.currentUser$ = this.store.select(selectCurrentUser)

    this.createPostForm.get('body')?.valueChanges.subscribe(() => {
      this.resizeTextarea()
    })
  }

  resizeTextarea() {
    const textarea = this.textareaRef.nativeElement

    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
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
