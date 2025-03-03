import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { ProductService } from '../services/product.service';
import { ActivatedRoute, Route } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-product-detail',
  imports: [MatIconModule,ReactiveFormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
quantity = signal<number>(0)
productId : string | null = null
Product = signal<any | null>(null)
constructor(private product:ProductService,private route:ActivatedRoute,
  private cart:CartService,
){}
  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id')
    if (this.productId) {
      this.fetchProductById(this.productId)
    }
    
  }

  fetchProductById(id:string){
    return this.product.fetchProductById(id).subscribe({
      next:(value:any) =>{
        console.log(value)
        this.Product.set(value)
      },
      error(err:any) {
        console.log(err.error)
      },
    })
  }

  addQuantity(){
      if (!this.Product() || this.Product()?.totalStock <= 0) {
        this.product.setError("Product out of stock")
        setTimeout(()=>this.product.setError(null),2000)
        return
      }
      this.quantity.update(currentQuantity=>{
        const newQuantity = currentQuantity + 1
        if (this.Product()?.totalStock<=0) {
          this.product.setError("Product out of stock")
          setTimeout(()=>this.product.setError(null),2000)
          return currentQuantity
        }
        const updateProduct = {
          ...this.Product()!,totalStock: this.Product()!.totalStock - 1
        }

        this.Product.set(updateProduct)
        return newQuantity
      })
  }


  removeQuantity(){
    this.quantity.update(currentQuantity=>{
      const newQuantity = currentQuantity - 1
      console.log(currentQuantity)
      if (currentQuantity <=0) {
        this.product.setError("Product out of stock")
        setTimeout(()=>this.product.setError(null),2000)
        return currentQuantity
      }
      const updateProduct = {
        ...this.Product()!,totalStock: this.Product()!.totalStock + 1
      }
      this.Product.set(updateProduct)
      return newQuantity
    })
  }

  addToCart(){

    const formData = {
      quantity:this.quantity(),
      price:this.Product().price,
      productId:this.Product()._id
    }
    this.cart.add(formData).subscribe({
      next:(value:any)=> {
        this.product.setSuccessMessage(value.message || 'Added to Cart added successfully')
        setTimeout(()=> {
          this.product.setSuccessMessage(null)
        },2000)
      },
      error:(err)=> {
        console.log(err.error)
      },
    })
    
  }

  getErrorMessage(){
    return this.product.error()
  }
  getSuccessMessage(){
    console.log(this.product.success())
    return this.product.success()
  }

}
