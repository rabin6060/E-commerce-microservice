import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent,ReactiveFormsModule],
  template: `
    <app-header />
    <main class="main_layout">
      <router-outlet />
    </main>
    <app-footer />
    
  `,
  styles: [],
})
export class AppComponent {
  title = 'Frontend';
}
