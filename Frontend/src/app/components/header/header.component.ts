import { Component, signal,effect, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthserviceService } from '../../services/authservice.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { debounceTime, fromEvent } from 'rxjs';
@Component({
  selector: 'app-header',
  imports: [RouterLink,MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  user = signal<any | null>({})
  show = signal<boolean>(false)
  pageNumber ?: 1
  @ViewChild('searchInput') searchInput!:ElementRef
  constructor(private auth:AuthserviceService,private cart:CartService,private product:ProductService){
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
  ngAfterViewInit() {
    fromEvent<Event>(this.searchInput.nativeElement, 'input')
      .pipe(debounceTime(1000)) // Wait 1s after last keystroke
      .subscribe((event: Event) => {
        const title = (event.target as HTMLInputElement).value
        if (title.length > 0) {
          this.product.fetchProducts(1, title).subscribe({
            next: (value:any) => {
              this.product.products.set(value.products)
              console.log('Products, bro:', value);
            },
            error: (err) => {
              console.error('Error, bro:', err);
            }
          });
        } else {
          this.product.fetchProducts(1, null).subscribe({
            next: (value:any) => {
              this.product.products.set(value.products)
              console.log('Products, bro:', value);
            },
            error: (err) => {
              console.error('Error, bro:', err);
            }
          });
        }
      });
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
  AllProducts(){
    this.product.fetchProducts(1, null).subscribe({
      next: (value:any) => {
        this.product.products.set(value.products)
        console.log('Products, bro:', value);
      },
      error: (err) => {
        console.error('Error, bro:', err);
      }
    });
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
