import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  expandedPosts: Record<string, boolean> = {}

  setExpanded(id: string) {
    this.expandedPosts[id] = true
  }

  isExpanded(id: string) {
    return this.expandedPosts[id]
  }
}
