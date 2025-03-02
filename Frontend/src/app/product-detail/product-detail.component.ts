import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { ProductService } from '../services/product.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  imports: [],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
productId : string | null = null
Product = signal<any | null>(null)
constructor(private product:ProductService,private route:ActivatedRoute){}
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

}
