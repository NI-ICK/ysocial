import { Routes } from '@angular/router'
import { HomePageComponent } from './features/home/home-page/home-page.component'
import { PostDetailsComponent } from './features/posts/post-details/post-details.component'
import { UserProfileComponent } from './features/users/user-profile/user-profile.component'
import { FollowersPageComponent } from './features/users/followers-page/followers-page.component'
import { FollowingPageComponent } from './features/users/following-page/following-page.component'
import { NotFoundComponent } from './features/not-found/not-found.component'

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'not-found', component: NotFoundComponent },

  { path: ':username', component: UserProfileComponent },
  { path: ':username/followers', component: FollowersPageComponent },
  { path: ':username/following', component: FollowingPageComponent },
  { path: ':username/:postId', component: PostDetailsComponent },

  { path: '**', redirectTo: 'not-found' },
]
