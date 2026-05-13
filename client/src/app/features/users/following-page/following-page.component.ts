import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { Store } from '@ngrx/store'
import {
  selectFollowing,
  selectFollowingLoading,
  selectNoMoreFollowing,
} from '../../../store/users/users.selectors'
import { Observable, take } from 'rxjs'
import {
  clearFollowing,
  loadFollowing,
} from '../../../store/users/users.actions'
import { CommonModule, isPlatformBrowser, NgFor } from '@angular/common'
import { InfiniteScrollDirective } from 'ngx-infinite-scroll'
import { User } from '../../../utils/interfaces/user.interface'
import { UserCardComponent } from '../user-card/user-card.component'
import { LoadingComponent } from '../../../shared/loading/loading.component'

@Component({
  selector: 'following-page',
  imports: [
    InfiniteScrollDirective,
    NgFor,
    CommonModule,
    UserCardComponent,
    RouterLink,
    LoadingComponent,
  ],
  templateUrl: './following-page.component.html',
  styleUrl: './following-page.component.scss',
})
export class FollowingPageComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  following$ = new Observable<User[]>()
  noMoreFollowing$ = new Observable<boolean>()
  followingLoading$ = new Observable<boolean>()
  username = this.activatedRoute.snapshot.paramMap.get('username')
  loadOffset = 0
  isBrowser = false

  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId)
  }

  ngOnInit() {
    this.following$ = this.store.select(selectFollowing)
    this.noMoreFollowing$ = this.store.select(selectNoMoreFollowing)
    this.followingLoading$ = this.store.select(selectFollowingLoading)
  }

  ngAfterViewInit() {
    this.fillFollowingToScreen()
  }

  loadFollowing(offset: number) {
    this.followingLoading$.pipe(take(1)).subscribe((loading) => {
      if (loading || !this.username) return

      this.store.dispatch(loadFollowing({ username: this.username, offset }))
      this.loadOffset += 5
    })
  }

  fillFollowingToScreen() {
    if (!this.isBrowser) return

    setTimeout(() => {
      const check = () => {
        const isScrollable =
          document.documentElement.scrollHeight > window.innerHeight

        if (!isScrollable) {
          this.noMoreFollowing$.pipe(take(1)).subscribe((noMore) => {
            if (noMore) return

            this.loadFollowing(this.loadOffset)

            setTimeout(check, 200)
          })
        }
      }

      check()
    }, 100)
  }

  onScroll = () => this.loadFollowing(this.loadOffset)

  ngOnDestroy() {
    this.store.dispatch(clearFollowing())
  }
}
