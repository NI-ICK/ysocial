import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { User } from '../../../utils/user.interface'
import { AuthService } from '../../auth/auth-service/auth.service'
import { ImageIconComponent } from '../../../shared/icons/image-icon/image-icon.component'
import { ImagePreloadDirective } from '../../../shared/directives/image-preload/image-preload.directive'
import { CommonModule, NgIf } from '@angular/common'
import { Observable, take } from 'rxjs'
import { Apollo } from 'apollo-angular'
import { CREATE_POST } from '../../../graphql/post.operations'
import { PopupService } from '../../../shared/popup/popup.service'

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
  @ViewChild('fileInput') fileInput!: ElementRef
  selectedFile: File | null = null
  imagePreview = ''

  createPostForm = this.fb.group({
    title: [''],
    body: [''],
  })

  constructor(
    private authService: AuthService,
    private apollo: Apollo,
    private popupService: PopupService
  ) {}

  ngOnInit() {
    this.currentUser$ = this.authService.getCurrentUser()
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
    if (!this.createPostForm.get('body')?.value && !this.selectedFile) return

    this.currentUser$.pipe(take(1)).subscribe((currentUser) => {
      if (!currentUser) return

      this.apollo
        .mutate({
          mutation: CREATE_POST,
          variables: {
            userId: currentUser.id,
            title: this.createPostForm.get('title')?.value || null,
            body: this.createPostForm.get('body')?.value || null,
            ...(this.selectedFile && { image: this.selectedFile }),
          },
        })
        .subscribe({
          next: () => this.popupService.showPopup('Post created'),
          error: (err) => console.log('Error: ', err),
        })
    })

    this.createPostForm.reset()
    this.handleRemoveFile()
  }
}
