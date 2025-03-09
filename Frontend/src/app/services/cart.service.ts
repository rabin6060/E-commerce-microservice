import { HttpClient } from '@angular/common/http';
import { computed, effect, Injectable, OnInit, signal } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = signal<any | null>(null)
  cartItemQuantity = computed(()=>this.cartItems ? this.cartItems().cartItems.length : 0)
  constructor(private http:HttpClient,private route:ActivatedRoute) {
    effect(()=>{
      console.log('count')
      this.cartItemQuantity()
    })
   }
   
   
  add(body:any){
    const baseUrl='http://localhost:3000/v1/cart'
    return this.http.post(baseUrl,body,{
      headers:{
        'Content-Type':'application/json'
      }
    })
  }
  getAllCartItemsOfUser(){
    const baseUrl='http://localhost:3000/v1/cart'
    return this.http.get(baseUrl,{
      headers:{
        'Content-Type':'application/json'
      }
    })
  }
  setCartInfo(data: any | null){
    return this.cartItems.set(data)
  }
  manageCartItems(id:string,action:string,body:any){
    const baseUrl=`http://localhost:3000/v1/cart/${id}?action=${action}`
    return this.http.post(baseUrl,body,{
      headers:{
        'Content-Type':'application/json'
      }
    })
  }
}
