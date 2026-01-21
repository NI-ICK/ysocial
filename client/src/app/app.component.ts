import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { NavbarComponent } from './features/navbar/navbar.component'
import { PopupComponent } from './shared/popup/popup.component'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, PopupComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
