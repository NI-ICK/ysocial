import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core'
import { CommonModule, isPlatformBrowser } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { Store } from '@ngrx/store'
import { loadPosts } from '../../../store/posts/posts.actions'
import {
  selectAllPosts,
  selectNoMorePosts,
  selectPostsLoading,
} from '../../../store/posts/posts.selectors'
import { CreatePostFormComponent } from '../create-post-form/create-post-form.component'
import { PostCardComponent } from '../../posts/post-card/post-card.component'
import { InfiniteScrollDirective } from 'ngx-infinite-scroll'
import { Observable, take } from 'rxjs'
import { LoadingComponent } from '../../../shared/loading/loading.component'
@Component({
  selector: 'home-page',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    CreatePostFormComponent,
    PostCardComponent,
    InfiniteScrollDirective,
    LoadingComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit, AfterViewInit {
  posts$ = this.store.select(selectAllPosts)
  noMorePosts$ = new Observable<boolean>()
  postsLoading$ = new Observable<boolean>()
  loadOffset = 0
  isBrowser = false

  constructor(private store: Store, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId)
  }

  ngOnInit() {
    this.loadPosts(0)

    this.noMorePosts$ = this.store.select(selectNoMorePosts)
    this.postsLoading$ = this.store.select(selectPostsLoading)
  }

  ngAfterViewInit() {
    this.fillPostsToScreen()
  }

  loadPosts(offset: number) {
    this.store
      .select(selectPostsLoading)
      .pipe(take(1))
      .subscribe((loading) => {
        if (loading) return

        this.store.dispatch(loadPosts({ offset }))
        this.loadOffset += 5
      })
  }

  fillPostsToScreen() {
    if (!this.isBrowser) return

    setTimeout(() => {
      const isScrollable =
        document.documentElement.scrollHeight > window.innerHeight

      if (!isScrollable) {
        this.noMorePosts$.pipe(take(1)).subscribe((noMore) => {
          if (noMore) return

          this.loadPosts(this.loadOffset)
          this.fillPostsToScreen()
        })
      }
    }, 100)
  }

  onScroll() {
    this.loadPosts(this.loadOffset)
  }
}
