import { Component, OnInit, signal } from '@angular/core';
import { CartService } from '../services/cart.service';
import { CartItemComponent } from "../components/cart-item/cart-item.component";
import { RouterLink } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';
import { switchMap } from 'rxjs';
import { StripeService } from 'ngx-stripe';

@Component({
  selector: 'app-cart',
  imports: [CartItemComponent,RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  
  constructor(
    private cart:CartService,
    private checkoutService:CheckoutService,
    private stripeService:StripeService
  ){}
  ngOnInit(): void {
    this.getAllCartItems()
  }
  private getAllCartItems(){
    this.cart.getAllCartItemsOfUser().subscribe({
      next:(value:any)=>{
        console.log(value)
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
  checkout() {
    const formData = {
      items: this.cart.cartItems().cartItems
    };

    this.checkoutService
      .checkout(formData)
      .pipe(
        switchMap((result: any) => {
          console.log('Checkout Session:', result);
          return this.stripeService.redirectToCheckout({
            sessionId: result.session_id,
          });
        })
      )
      .subscribe({
        next: (result) => {
          console.log('Redirect to Checkout successful:', result);
        },
        error: (error) => {
          console.error('Error redirecting to Checkout:', error);
          
        },
      });
  }
}
