import { Component, OnInit } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CreatePostFormComponent } from '../create-post-form/create-post-form.component'
import { Store } from '@ngrx/store'
import { loadPosts } from '../../../store/posts/posts.actions'
import {
  selectAllPosts,
  selectPostsLoading,
} from '../../../store/posts/posts.selectors'
import { CommonModule } from '@angular/common'
import { PostCardComponent } from '../../posts/post-card/post-card.component'
import { take } from 'rxjs'

@Component({
  selector: 'home-page',
  imports: [
    ReactiveFormsModule,
    CreatePostFormComponent,
    CommonModule,
    PostCardComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  constructor(private store: Store) {}

  posts$ = this.store.select(selectAllPosts)

  ngOnInit() {
    this.store
      .select(selectPostsLoading)
      .pipe(take(1))
      .subscribe((loading) => {
        if (!loading) this.store.dispatch(loadPosts())
      })
  }
}
