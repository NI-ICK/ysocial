import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { combineLatest, Observable, take } from 'rxjs'
import { Store } from '@ngrx/store'
import { selectUserProfile } from '../../../store/users/users.selectors'
import {
  clearUserProfile,
  loadUserProfile,
  toggleFollow,
} from '../../../store/users/users.actions'
import { CommonModule, isPlatformBrowser, NgIf } from '@angular/common'
import { User } from '../../../utils/interfaces/user.interface'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { CreatedPostsComponent } from '../created-posts/created-posts.component'
import { LikedPostsComponent } from '../liked-posts/liked-posts.component'

type PostsState = 'created' | 'liked'

@Component({
  selector: 'app-user-profile',
  imports: [
    NgIf,
    CommonModule,
    RouterLink,
    CreatedPostsComponent,
    LikedPostsComponent,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userProfile$ = new Observable<User | null>()
  currentUser$ = new Observable<User | null>()
  postsState!: PostsState
  isBrowser = false

  constructor(
    private activatedRoute: ActivatedRoute,
    private store: Store,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId)
  }

  ngOnInit() {
    this.userProfile$ = this.store.select(selectUserProfile)
    this.currentUser$ = this.store.select(selectCurrentUser)

    this.activatedRoute.params.subscribe((params) => {
      const username = params['username']
      if (username) this.store.dispatch(loadUserProfile({ username }))
    })

    if (this.isBrowser) {
      const value = sessionStorage.getItem('profilePostsState')
      if (value === 'created' || value === 'liked') this.postsState = value
      else this.postsState = 'created'
    }
  }

  handleButtonClick(state: PostsState) {
    this.postsState = state
    sessionStorage.setItem('profilePostsState', state)
  }

  handleFollow() {
    this.userProfile$.pipe(take(1)).subscribe((userProfile) => {
      if (!userProfile) return

      this.store.dispatch(
        toggleFollow({
          userId: userProfile.id,
        })
      )
    })
  }

  ngOnDestroy() {
    this.store.dispatch(clearUserProfile())
    if (this.isBrowser) sessionStorage.removeItem('profilePostsState')
  }
}
