import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthserviceService } from '../services/authservice.service';
import { catchError } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  userInfo = new FormGroup({
    email:new FormControl(''),
    password: new FormControl('')
  })

  constructor(private auth:AuthserviceService,private router:Router){}
  onSubmit(){
    if (this.userInfo.valid) {
      const loginData = this.userInfo.value as {email:string,password:string}
      this.auth.login(loginData).subscribe({
        next:(value:any)=> {
          this.auth.setResponse(value)
          localStorage.setItem('token',value.accessToken)
          this.router.navigate(['/'])
        },
        error:(err:any)=>{
          this.auth.setResponse(err.error)
        }
      })
    }
  }
  getUserInfo(){
    return this.auth.response()
  }
}
