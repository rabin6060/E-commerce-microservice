import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  error = signal<string | null>(null)
  success = signal<string | null>(null)
  loading = signal<boolean>(false)
  products = signal<Product[] | null>([])
  constructor(private http:HttpClient) { }
  
  fetchProducts(pageNumber:number | null,title:string | null ){
    const baseUrl = 'http://localhost:3000/v1/product';
    let url = `${baseUrl}?pageNumber=${pageNumber || 1}`;
    
    // Only add title param if it’s not null or empty
    if (title && title.length > 0) {
      url += `&title=${encodeURIComponent(title)}`;
    }

    return this.http.get(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  fetchProductById(id:string){
    const baseUrl = 'http://localhost:3000/v1/product'
    return this.http.get(`${baseUrl}/${id}`,{
      headers:{
        'Content-Type':'application/json'
      }})
  }
  setError(data:string | null){
    this.error.set(data)
  }
  setSuccessMessage(data:string | null){
    this.success.set(data)
  }
  setLoading(data:boolean){
    this.loading.set(data)
  }
  setProduct(data:Product[]){
    this.products.set(data)
  }
}
