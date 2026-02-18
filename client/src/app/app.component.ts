import { Component, OnInit } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { NavbarComponent } from './features/nav/navbar/navbar.component'
import { PopupComponent } from './shared/popup/popup.component'
import { Store } from '@ngrx/store'
import { loadUser } from './store/auth/auth.actions'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, PopupComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(loadUser())
  }
}
