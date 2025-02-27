import { Component, signal,effect } from '@angular/core';
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
  token = signal<string | null>(''); // Initialize from localStorage
  user = signal<any | null>({})
  
  constructor(private auth:AuthserviceService){
    effect(()=>{
      const response = this.auth.response()
      if (response?.user) {
        this.token.set(response.user.accessToken)
        this.user.set(response.user)
          }
        this.token.set(localStorage.getItem('token'))
        const userData = localStorage.getItem('user')
        this.user.set(userData ? JSON.parse(userData) : null)
    })
  }

  
  isLoggedIn(){
   return !!this.token
  }
  logout(){
    this.auth.setResponse({})
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    this.token.set(null)
    this.user.set(null)
  }
}
