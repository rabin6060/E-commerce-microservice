import { Component, effect, signal } from '@angular/core';
import { AuthserviceService } from '../services/authservice.service';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [MatIconModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  userInfo = signal<any | null>(this.getInitialUserInfo());
  focus = signal<string | null>(null);
  trackDelete = signal<boolean>(false)
  editUserInfo = new FormGroup({
    username: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    profilePic: new FormControl(null as File | null)
  });

  constructor(private auth: AuthserviceService,private router:Router) {
    this.updateFormValues();

    effect(() => {
      const inputId = this.focus();
      if (inputId) {
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) input.focus();
      }
     
      const user = this.userInfo() || {};
      this.editUserInfo.patchValue({
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      
      });
      
    });
  }

  private getInitialUserInfo(): any | null {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      return null;
    }
  }

  private updateFormValues() {
    const user = this.userInfo() || {};
    this.editUserInfo.patchValue({
      username: user.username || '',
      firstName: user.firstName || '',
      lastName: user.lastName || ''
      // Don’t reset profilePic here
    });
  }

  fileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      this.editUserInfo.patchValue({ profilePic: file });
     
      const reader = new FileReader();
      reader.onload = () => {
        this.userInfo.update(info => ({ ...info, profilePic: reader.result as string }));
        console.log('Preview updated, userInfo.profilePic:', this.userInfo().profilePic);
        input.value = ''; // Clear after reading
      };
      reader.onerror = () => console.error('FileReader error');
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  }

  onSubmit() {
    if (this.editUserInfo.valid) {
      const formValue = this.editUserInfo.value;
      console.log('Form value before FormData:', formValue); 

      const formData = new FormData();
      formData.append('username', formValue.username || '');
      formData.append('firstName', formValue.firstName || '');
      formData.append('lastName', formValue.lastName || '');
      this.auth.setLoading(true)
      if (formValue.profilePic instanceof File) {
        formData.append('profilePic', formValue.profilePic, formValue.profilePic.name);
      }
      this.auth.edit(formData).subscribe({
        next: (value: any) => {
          this.auth.setResponse(value.user)
          this.auth.setLoading(false)
          this.auth.setMessage(value.message);
          this.userInfo.set(value.user);
          localStorage.setItem('user', JSON.stringify(value.user));
          setTimeout(()=>this.auth.setMessage(null) ,3000)
        },
        error: (err: any) => {
          this.auth.setLoading(false)
          this.auth.setError(err.error || 'user update failed!!');
          setTimeout(()=>this.auth.setError(null),2000)
          console.error('Edit error:', err);
          console.log('Server response:', err.error);
        }
      });
    }
  }
  deleteProfile(){
    this.trackDelete.set(true)
    this.auth.delete().subscribe({
      next:(value:any)=>{
        this.trackDelete.set(false)
        this.auth.setMessage(value.message)
        setTimeout(()=>{
          this.auth.setMessage(null)
          this.router.navigate(['signup'])
        },2000)
      },
      error:(err:any)=>{
        console.log(err)
        this.trackDelete.set(false)
        this.auth.setError(err.error)
        setTimeout(()=>this.auth.setError(null),2000)
      }
    })
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
  onEditClick(targetedInput: string) {
    this.focus.set(targetedInput);
  }
}