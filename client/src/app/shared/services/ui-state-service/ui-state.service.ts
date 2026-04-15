import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  expandedPosts: Record<string, boolean> = {}
  expandedReplies: Record<string, boolean> = {}

  setExpandedPost(id: string) {
    this.expandedPosts[id] = true
  }

  isPostExpanded(id: string) {
    return this.expandedPosts[id]
  }

  expandReplies(id: string) {
    this.expandedReplies[id] = true
  }

  collapseReplies(id: string) {
    this.expandedReplies[id] = false
  }

  areRepliesExpanded(id: string) {
    return this.expandedReplies[id]
  }
}
