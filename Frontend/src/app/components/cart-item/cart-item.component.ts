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

incCartItem(){
  const formData = {
    
  }
}

}
