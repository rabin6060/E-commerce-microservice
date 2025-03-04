import { Component, OnInit, signal } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CartItemComponent } from "../components/cart-item/cart-item.component";

@Component({
  selector: 'app-cart',
  imports: [CartItemComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  
  constructor(
    private cart:CartService
  ){}
  ngOnInit(): void {
    this.getAllCartItems()
  }
  getAllCartItems(){
    this.cart.getAllCartItems().subscribe({
      next:(value:any)=>{
        
        this.cart.setCartInfo(value)
      },
      error:(err)=>{
        console.log(err)
      }
    })
  }
  getCartInfo(){
   return this.cart.cartItems()
  }
}
