import { Component, Input, OnInit } from '@angular/core'
import { User } from '../../../utils/interfaces/user.interface'
import { Observable, take } from 'rxjs'
import { toggleFollow } from '../../../store/users/users.actions'
import { Store } from '@ngrx/store'
import { selectCurrentUser } from '../../../store/auth/auth.selectors'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'user-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss',
})
export class UserCardComponent implements OnInit {
  @Input() user!: User
  currentUser$ = new Observable<User | null>()

  constructor(private store: Store) {}

  ngOnInit() {
    this.currentUser$ = this.store.select(selectCurrentUser)
  }

  handleFollow() {
    this.store.dispatch(
      toggleFollow({
        userId: this.user.id,
      })
    )
  }
}
