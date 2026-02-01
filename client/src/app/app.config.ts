import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
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
  ],
}
