import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private http:HttpClient) { }
  add(body:any){
    const baseUrl='http://localhost:3000/v1/cart'
    return this.http.post(baseUrl,body,{
      headers:{
        'Content-Type':'application/json'
      }
    })
  }
}
