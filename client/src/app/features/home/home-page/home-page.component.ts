import { Component } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { CreatePostFormComponent } from '../create-post-form/create-post-form.component'
@Component({
  selector: 'home-page',
  imports: [ReactiveFormsModule, CreatePostFormComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {}
