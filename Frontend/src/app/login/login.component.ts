import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthserviceService } from '../services/authservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{
  userInfo = new FormGroup({
    email:new FormControl(''),
    password: new FormControl('')
  })

  constructor(private auth:AuthserviceService,private router:Router){}
  ngOnInit(): void {
    if (this.auth.currentUser()?.user?.accessToken) {
      console.log('already login')
      this.router.navigate(['/'])
    }
  }
  onSubmit(){
    if (this.userInfo.invalid) {
     return this.auth.setLoading(false)
    }
    this.auth.setLoading(true)
    const loginData = this.userInfo.value as {email:string,password:string}
    this.auth.login(loginData).subscribe({
      next:(value:any)=> {
        this.auth.setResponse(value.user)
        this.auth.setLoading(false)
        this.auth.setMessage(value.message)
        localStorage.setItem('user',JSON.stringify(value.user))
        setTimeout(()=> {
          this.auth.setMessage(null)
          this.router.navigate(['/'])
        },1000)
        
      },
      error:(err:any)=>{
        console.log(err)
        this.auth.setLoading(false)
        this.auth.setError(err.error.message)
        setTimeout(()=> this.auth.setError(null),3000)
        
       // this.auth.setResponse(err.error)
      }
    })
  }
  getUserInfo(){
    return this.auth.currentUser()
  }
  getErrorMessage(){
    return this.auth.error()
  }
  getLoadingInfo(){
    return this.auth.loading()
  }
  getSuccessMessage(){
    return this.auth.message()
  }
}
