import {
  Component,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core'
import {
  selectCreatedPostsLoading,
  selectNoMoreCreatedPosts,
} from '../../../store/users/users.selectors'
import { Store } from '@ngrx/store'
import { Observable, take } from 'rxjs'
import { Post } from '../../../utils/interfaces/post.interface'
import { selectCreatedPosts } from '../../../store/posts/posts.selectors'
import {
  clearCreatedPosts,
  loadCreatedPosts,
} from '../../../store/users/users.actions'
import { CommonModule, isPlatformBrowser } from '@angular/common'
import { PostCardComponent } from '../../posts/post-card/post-card.component'
import { InfiniteScrollDirective } from 'ngx-infinite-scroll'
import { LoadingComponent } from '../../../shared/loading/loading.component'

@Component({
  selector: 'created-posts',
  imports: [
    PostCardComponent,
    InfiniteScrollDirective,
    CommonModule,
    LoadingComponent,
  ],
  templateUrl: './created-posts.component.html',
  styleUrl: './created-posts.component.scss',
})
export class CreatedPostsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() userId!: string
  createdPosts$ = new Observable<Post[]>()
  noMoreCreatedPosts$ = new Observable<Boolean>()
  createdPostsLoading$ = new Observable<Boolean>()
  isBrowser = false
  loadOffset = 5

  constructor(private store: Store, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId)
  }

  ngOnInit() {
    this.createdPosts$ = this.store.select(selectCreatedPosts)
    this.noMoreCreatedPosts$ = this.store.select(selectNoMoreCreatedPosts)
    this.createdPostsLoading$ = this.store.select(selectCreatedPostsLoading)
  }

  ngOnChanges() {
    this.fillPostsToScreen()
  }

  loadPosts(offset: number) {
    this.createdPostsLoading$.pipe(take(1)).subscribe((loading) => {
      if (loading) return

      this.store.dispatch(loadCreatedPosts({ userId: this.userId, offset }))
      this.loadOffset += 5
    })
  }

  fillPostsToScreen() {
    if (!this.isBrowser) return

    setTimeout(() => {
      const check = () => {
        const isScrollable =
          document.documentElement.scrollHeight > window.innerHeight

        if (!isScrollable) {
          this.noMoreCreatedPosts$.pipe(take(1)).subscribe((noMore) => {
            if (noMore) return

            this.loadPosts(this.loadOffset)

            setTimeout(check, 200)
          })
        }
      }

      check()
    }, 100)
  }

  onScroll = () => this.loadPosts(this.loadOffset)

  ngOnDestroy() {
    this.store.dispatch(clearCreatedPosts())
  }
}
