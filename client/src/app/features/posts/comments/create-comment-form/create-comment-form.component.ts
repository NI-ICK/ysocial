import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core'
import { Store } from '@ngrx/store'
import { selectCurrentUser } from '../../../../store/auth/auth.selectors'
import { Observable } from 'rxjs'
import { User } from '../../../../utils/interfaces/user.interface'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { CommonModule, NgIf } from '@angular/common'
import { createComment } from '../../../../store/comments/comments.actions'

@Component({
  selector: 'create-comment-form',
  imports: [ReactiveFormsModule, NgIf, CommonModule],
  templateUrl: './create-comment-form.component.html',
  styleUrl: './create-comment-form.component.scss',
})
export class CreateCommentFormComponent implements OnInit {
  @Input() postId!: string
  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>
  currentUser$: Observable<User | null> = new Observable()
  fb = new FormBuilder()
  createCommentForm = this.fb.group({
    body: [''],
  })

  constructor(private store: Store) {}

  ngOnInit() {
    this.currentUser$ = this.store.select(selectCurrentUser)

    this.createCommentForm.get('body')?.valueChanges.subscribe(() => {
      this.resizeTextarea()
    })
  }

  resizeTextarea() {
    const textarea = this.textareaRef.nativeElement

    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }

  handleFormSubmit() {
    const body = this.createCommentForm.get('body')?.value

    if (!body) return

    this.store.dispatch(
      createComment({
        body,
        postId: this.postId,
        parentId: null,
      })
    )
    this.createCommentForm.reset()
  }
}
