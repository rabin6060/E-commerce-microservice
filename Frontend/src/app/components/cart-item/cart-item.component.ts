import { Component, Input, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-item',
  imports: [MatIconModule],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss'
})
export class CartItemComponent {
@Input({required:true}) CartItem:any
quantity = signal<number | null>(null)
constructor(private cart:CartService){}

incCartItem(id:string,item:any){
  item.quantity++
  const formData = {
    productId:item.productId,
    price:item.price,
    quantity:item.quantity
  }
  
  this.cart.manageCartItems(id,'inc',formData).subscribe({
    next:(value:any)=>{
      this.cart.setCartInfo(value.cart)
    },
    error:(err)=>{
      console.log(err)
    }
  })
}

decCartItem(id:string,item:any){
  if (item.quantity > 0) {
    item.quantity--
  }
  const formData = {
    productId:item.productId,
    price:item.price,
    quantity:item.quantity
  }
  this.cart.manageCartItems(id,'dec',formData).subscribe({
    next:(value:any)=>{
      this.cart.setCartInfo(value.cart)
    },
    error:(err)=>{
      console.log(err)
    }
  })
}

removeCartItem(id:string,item:any){
  const formData = {
    productId:item.productId,
    price:item.price,
    quantity:item.quantity
  }
  this.cart.manageCartItems(id,'rem',formData).subscribe({
    next:(value:any)=>{
      this.cart.setCartInfo(value.cart)
    },
    error:(err)=>{
      console.log(err)
    }
  })
}

getCartId(){
  return this.cart.cartItems()._id
 }

}


