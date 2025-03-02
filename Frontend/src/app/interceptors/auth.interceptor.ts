import {  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    const user = localStorage.getItem('user')
    const parseValue =user ? JSON.parse(user) : {}
    if (parseValue?.accessToken) {
        const newReqPath = req.clone({
            setHeaders:{
                'authorization':`Bearer ${parseValue?.accessToken}`,
                
            }
        })
        return handler.handle(newReqPath)
    }
    return handler.handle(req)
  }
}