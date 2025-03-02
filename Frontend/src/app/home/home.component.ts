import { Component, OnInit, signal } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { ProductItemComponent } from "../components/product-item/product-item.component";

@Component({
  selector: 'app-home',
  imports: [ProductItemComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  products = signal<Array<Product> | null>([])
  constructor(private product:ProductService){}
  ngOnInit(): void {
    this.fetchProducts()
  }
  fetchProducts(){
    this.product.fetchProducts().subscribe({
      next:(value:any)=>{
        console.log(value)
        this.products.set(value)
      },
      error:(err:any)=> {
        this.products.set(err.error)
      }
    }
    )
  }
}
