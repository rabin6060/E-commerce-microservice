import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';

@Component({
  selector: 'app-success',
  imports: [],
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss'
})
export class SuccessComponent implements OnInit {
  sessionId !:string 
constructor(private route:ActivatedRoute,private checkoutService:CheckoutService,private router:Router){}
ngOnInit(): void {
  this.route.queryParams.subscribe(params=>{
    this.sessionId = params['session_id']
    console.log(this.sessionId)
  })
}
success(){
 this.checkoutService.success(this.sessionId)
 .subscribe({
  next:(value)=> {
    console.log(value)
    console.log('payment successfull')
    this.router.navigate([''])
  },
  error:(err)=> {
    console.log(err,'aako hora')
  },
 })
}
cancel(){
  this.checkoutService.cancel().subscribe(
    {
      next:(value)=> {
        console.log(value)
        console.log('payment successfull')
        this.router.navigate(['cart'])
      },
      error:(err)=> {
        console.log(err,'aako hora')
      },}
  )
}
}
