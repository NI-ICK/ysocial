import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core'
import { provideRouter } from '@angular/router'
import { routes } from './app.routes'
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser'
import { provideHttpClient } from '@angular/common/http'
import { provideApollo } from 'apollo-angular'
import { InMemoryCache } from '@apollo/client'
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs'
import { environment } from '../environments/environment.development'
import { provideStore } from '@ngrx/store'
import { provideEffects } from '@ngrx/effects'
import { provideStoreDevtools } from '@ngrx/store-devtools'
import { postsReducer } from './store/posts/posts.reducer'
import { PostsEffects } from './store/posts/posts.effects'
import { AuthEffects } from './store/auth/auth.effects'
import { authReducer } from './store/auth/auth.reducer'
import { commentsReducer } from './store/comments/comments.reducer'
import { CommentsEffects } from './store/comments/comments.effects'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    provideApollo(() => ({
      link: new UploadHttpLink({
        uri: environment.GRAPHQL_URL,
        credentials: 'include',
        headers: { 'Apollo-Require-Preflight': 'true' },
      }),
      cache: new InMemoryCache(),
    })),
    provideStore({
      auth: authReducer,
      posts: postsReducer,
      comments: commentsReducer,
    }),
    provideStoreDevtools(),
    provideEffects([PostsEffects, AuthEffects, CommentsEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
}
