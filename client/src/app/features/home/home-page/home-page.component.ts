import { Component, OnInit } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CreatePostFormComponent } from '../create-post-form/create-post-form.component'
import { PostFeedComponent } from '../../posts/post-feed/post-feed.component'
import { Store } from '@ngrx/store'
import { loadPosts } from '../../../store/posts/posts.actions'
import { selectAllPosts } from '../../../store/posts/posts.selectors'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'home-page',
  imports: [
    ReactiveFormsModule,
    CreatePostFormComponent,
    PostFeedComponent,
    CommonModule,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  constructor(private store: Store) {}

  posts$ = this.store.select(selectAllPosts)

  ngOnInit() {
    this.store.dispatch(loadPosts())
  }
}
