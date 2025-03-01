import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthserviceService } from '../services/authservice.service';

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
  constructor(private auth:AuthserviceService){}
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
        next:(value)=> {
          console.log(value)
        },
        error:(err)=> {
          console.log(err)
        },
      })
    }
  }
}
