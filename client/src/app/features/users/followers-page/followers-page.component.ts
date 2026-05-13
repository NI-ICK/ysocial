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
  selectFollowers,
  selectFollowersLoading,
  selectNoMoreFollowers,
} from '../../../store/users/users.selectors'
import { Observable, take } from 'rxjs'
import {
  clearFollowers,
  loadFollowers,
} from '../../../store/users/users.actions'
import { CommonModule, isPlatformBrowser, NgFor } from '@angular/common'
import { InfiniteScrollDirective } from 'ngx-infinite-scroll'
import { User } from '../../../utils/interfaces/user.interface'
import { UserCardComponent } from '../user-card/user-card.component'
import { LoadingComponent } from '../../../shared/loading/loading.component'

@Component({
  selector: 'followers-page',
  imports: [
    InfiniteScrollDirective,
    NgFor,
    CommonModule,
    UserCardComponent,
    RouterLink,
    LoadingComponent,
  ],
  templateUrl: './followers-page.component.html',
  styleUrl: './followers-page.component.scss',
})
export class FollowersPageComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  followers$ = new Observable<User[]>()
  noMoreFollowers$ = new Observable<boolean>()
  followersLoading$ = new Observable<boolean>()
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
    this.followers$ = this.store.select(selectFollowers)
    this.noMoreFollowers$ = this.store.select(selectNoMoreFollowers)
    this.followersLoading$ = this.store.select(selectFollowersLoading)
  }

  ngAfterViewInit() {
    this.fillFollowersToScreen()
  }

  loadFollowers(offset: number) {
    this.followersLoading$.pipe(take(1)).subscribe((loading) => {
      if (loading || !this.username) return

      this.store.dispatch(loadFollowers({ username: this.username, offset }))
      this.loadOffset += 5
    })
  }

  fillFollowersToScreen() {
    if (!this.isBrowser) return

    setTimeout(() => {
      const check = () => {
        const isScrollable =
          document.documentElement.scrollHeight > window.innerHeight

        if (!isScrollable) {
          this.noMoreFollowers$.pipe(take(1)).subscribe((noMore) => {
            if (noMore) return

            this.loadFollowers(this.loadOffset)

            setTimeout(check, 200)
          })
        }
      }

      check()
    }, 100)
  }

  onScroll = () => this.loadFollowers(this.loadOffset)

  ngOnDestroy() {
    this.store.dispatch(clearFollowers())
  }
}
