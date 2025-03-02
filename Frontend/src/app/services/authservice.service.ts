import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { LoginData } from '../models/user.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthserviceService {
  currentUser = signal<any | null> (null)
  loading = signal<boolean>(false)
  error = signal<string | null>(null)
  message = signal<string | null>(null)
  response = signal<any>({});
  constructor(private http:HttpClient) { }
 
  signup(body:any){
    const url = 'http://localhost:3000/v1/auth/register'
    return this.http.post(url,body,{
      responseType:'json'
    })
  }
  login(body:LoginData){
    const url = 'http://localhost:3000/v1/auth/login'
    return this.http.post(url,body,{responseType:'json',headers:{
      'Content-Type':'application/json'
    }})
  }
  edit(body:any){
    const url = 'http://localhost:3000/v1/auth/edit'
    return this.http.patch(url,body,{
      responseType:'json'
    })
  }
  delete(){
    const url = 'http://localhost:3000/v1/auth/delete'
    return this.http.delete(url,{
      headers:{
        'Content-Type':'application/json'
      }
    }).pipe(
      tap(() => this.clearUserData())
    );
  }
  private clearUserData() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.response.set({});
    
  }
  setResponse(data:any){
    this.response.set(data)
  }
  setLoading(data:boolean){
    this.loading.set(data)
  }
  setError(data:string | null){
    this.error.set(data)
  }
  setMessage(data:string | null){
    this.message.set(data)
  }
}
