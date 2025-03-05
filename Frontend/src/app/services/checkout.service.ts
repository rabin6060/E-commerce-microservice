import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(private http:HttpClient) { }
  checkout(body:any){
    const url = 'http://localhost:3000/v1/order'
    return this.http.post(url,body,{headers:{
      'Content-Type':'application/json'
    }})
  }
  success(id:string){
    const url = `http://localhost:3000/v1/order/success?sessionId=${id}`
    return this.http.get(url,{headers:{
      'Content-Type':'application/json'
    }})
  }
  cancel(){
    const url = 'http://localhost:3000/v1/order/cancel'
    return this.http.get(url,{headers:{
      'Content-Type':'application/json'
    }})
  }
}
