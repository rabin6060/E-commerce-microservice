import { Component, signal,effect, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthserviceService } from '../../services/authservice.service';
import { CartService } from '../../services/cart.service';
@Component({
  selector: 'app-header',
  imports: [RouterLink,MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  user = signal<any | null>({})
  show = signal<boolean>(false)
  constructor(private auth:AuthserviceService,private cart:CartService){
    effect(()=>{
      const response = this.auth.response()
      console.log(response)
      if (response?.user) {
        this.user.set(response.user)
          }
        const userData = localStorage.getItem('user')
        this.user.set(userData ? JSON.parse(userData) : {})
        console.log(this.user)
        this.getCartQuantity()
    })
    
  
  }
  ngOnInit(): void {
    this.cart.getAllCartItemsOfUser().subscribe({
      next:(value:any)=>{
        console.log(value.cartItems)
        this.cart.setCartInfo(value)
      },
      error:(err)=> {
        console.log(err.error)
      },
    })
    this.getCartQuantity()
  }
  getCartQuantity(){
    return this.cart.cartItemQuantity()
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
