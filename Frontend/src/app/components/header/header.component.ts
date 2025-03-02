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
  user = signal<any | null>({})
  show = signal<boolean>(false)
  
  constructor(private auth:AuthserviceService){
    effect(()=>{
      const response = this.auth.response()
      console.log(response)
      if (response?.user) {
        this.user.set(response.user)
          }
        const userData = localStorage.getItem('user')
        this.user.set(userData ? JSON.parse(userData) : {})
        console.log(this.user)
    })
  }

  
  
  logout(){
    this.auth.setResponse({})
    
    localStorage.removeItem('user')
    
    this.user.set(null)
    this.setShow()
  }
  setShow(){
    this.show.update(prev=>!prev)
  }
}
