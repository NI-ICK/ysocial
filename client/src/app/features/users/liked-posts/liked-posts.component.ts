import { CommonModule, isPlatformBrowser } from '@angular/common'
import {
  Component,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core'
import { Store } from '@ngrx/store'
import { Observable, take } from 'rxjs'
import { Post } from '../../../utils/interfaces/post.interface'
import { selectLikedPosts } from '../../../store/posts/posts.selectors'
import {
  selectLikedPostsLoading,
  selectNoMoreLikedPosts,
} from '../../../store/users/users.selectors'
import {
  clearLikedPosts,
  loadLikedPosts,
} from '../../../store/users/users.actions'
import { InfiniteScrollDirective } from 'ngx-infinite-scroll'
import { PostCardComponent } from '../../posts/post-card/post-card.component'
import { LoadingComponent } from '../../../shared/loading/loading.component'

@Component({
  selector: 'liked-posts',
  imports: [
    InfiniteScrollDirective,
    PostCardComponent,
    CommonModule,
    LoadingComponent,
  ],
  templateUrl: './liked-posts.component.html',
  styleUrl: './liked-posts.component.scss',
})
export class LikedPostsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() userId!: string
  likedPosts$ = new Observable<Post[]>()
  noMoreLikedPosts$ = new Observable<Boolean>()
  likedPostsLoading$ = new Observable<Boolean>()
  isBrowser = false
  loadOffset = 5

  constructor(private store: Store, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId)
  }

  ngOnInit() {
    this.likedPosts$ = this.store.select(selectLikedPosts)
    this.noMoreLikedPosts$ = this.store.select(selectNoMoreLikedPosts)
    this.likedPostsLoading$ = this.store.select(selectLikedPostsLoading)
  }

  ngOnChanges() {
    this.fillPostsToScreen()
  }

  loadPosts(offset: number) {
    this.likedPostsLoading$.pipe(take(1)).subscribe((loading) => {
      if (loading) return

      this.store.dispatch(loadLikedPosts({ userId: this.userId, offset }))
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
          this.noMoreLikedPosts$.pipe(take(1)).subscribe((noMore) => {
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
    this.store.dispatch(clearLikedPosts())
  }
}
