import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { LoginData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthserviceService {
  response = signal<any>({});
  constructor(private http:HttpClient) { }
  login(body:LoginData){
    const url = 'http://localhost:3000/v1/auth/login'
    return this.http.post(url,body,{responseType:'json',headers:{
      'Content-Type':'application/json'
    }})
  }
  setResponse(data:any){
    this.response.set(data)
  }
}
