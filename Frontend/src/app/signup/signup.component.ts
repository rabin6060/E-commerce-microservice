import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthserviceService } from '../services/authservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  userData = new FormGroup({
    username: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    profilePic: new FormControl(null as File | null),
  })
  constructor(private auth:AuthserviceService,private router:Router){}
  handleImage(event : Event){
    const input = event.target as HTMLInputElement
    if (input.files) {
      const file = input.files[0]
      const reader = new FileReader()

      reader.onload = () => {
        this.userData.patchValue({profilePic:file})
      }
      reader.readAsDataURL(file)
    }
  }
  Register(){
    if (this.userData.valid) {
      this.auth.setLoading(true)
      const formValue = this.userData.value
      const formData = new FormData()
      formData.append('username',formValue.username || '')
      formData.append('firstName',formValue.firstName || '')
      formData.append('lastName',formValue.lastName || '')
      formData.append('email',formValue.email || '')
      formData.append('password',formValue.password || '')
      if (formValue.profilePic instanceof File) {
        formData.append('profilePic',formValue.profilePic)
      }
      this.auth.signup(formData).subscribe({
        next:(value:any)=> {
          this.auth.setLoading(false)
          this.auth.setMessage(value.message || "User Register Successfully")
          setTimeout(()=> {
            this.auth.setMessage(null)
            this.router.navigate(['login'])
          },2000)
         
        },
        error:(err)=> {
          this.auth.setLoading(false)
          this.auth.setError(err.error.message)
          setTimeout(()=> this.auth.setError(null),2000)
        },
      })
    }
  }
  getLoadingInfo(){
    return this.auth.loading()
  }
  getSuccessMessage(){
    return this.auth.message()
  }
  getErrorMessage(){
    return this.auth.error()
  }
}
