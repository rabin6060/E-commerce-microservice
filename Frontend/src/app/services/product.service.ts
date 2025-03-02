import { HttpClient } from '@angular/common/http';
import { Injectable, Input, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly apiUrl = 'http://localhost:3000/v1/product';
  constructor(private http:HttpClient) { }
  
  fetchProducts(){
    return this.http.get(this.apiUrl,{
      headers:{
        'Content-Type':'application/json'
      }
    })
  }
  fetchProductById(id:string){
    return this.http.get(`${this.apiUrl}/${id}`,{
      headers:{
        'Content-Type':'application/json'
      }})
  }
}
