import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:3000/v1/product';
  constructor(private http:HttpClient) { }
  
  fetchProducts(){
    return this.http.get(this.apiUrl)
  }
  
}
