import {  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor() {
    console.log('LoggingInterceptor instantiated');
  }
  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token')
    console.log(token)
    console.log('interceptor running')
    if (token) {
        const newReqPath = req.clone({
            setHeaders:{
                'authorization':`Bearer ${token}`,
               'Content-Type':'application/json'
            }
        })
        return handler.handle(newReqPath)
    }
    return handler.handle(req)
  }
}