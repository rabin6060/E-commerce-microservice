import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  error = signal<string | null>(null)
  success = signal<string | null>(null)
  loading = signal<boolean>(false)
  constructor(private http:HttpClient) { }
  
  fetchProducts(pageNumber:number | null){
    const baseUrl = 'http://localhost:3000/v1/product'
    return this.http.get(`${baseUrl}?pageNumber=${pageNumber}`,{
      headers:{
        'Content-Type':'application/json'
      }
    })
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
}
