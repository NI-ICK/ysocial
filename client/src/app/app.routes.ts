import { Routes } from '@angular/router'
import { HomePageComponent } from './features/home/home-page/home-page.component'
import { PostDetailsComponent } from './features/posts/post-details/post-details.component'

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: ':username/:postId', component: PostDetailsComponent },
]
