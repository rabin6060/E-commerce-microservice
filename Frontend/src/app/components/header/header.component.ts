import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthserviceService } from '../../services/authservice.service';
@Component({
  selector: 'app-header',
  imports: [RouterLink,MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  token = signal<string | null>('')
  constructor(private auth:AuthserviceService){}
  isLoggedIn(){
    if(localStorage.getItem('token')){
      this.token.set(localStorage.getItem('token'))
    }
    else return
  }
}
