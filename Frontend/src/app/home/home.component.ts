import { Component, OnInit, signal } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  response = signal<Array<Product> | null>([])
  constructor(private product:ProductService){}
  ngOnInit(): void {
    this.fetchProducts()
  }
  fetchProducts(){
    this.product.fetchProducts().subscribe({
      next:(value:any)=>{
        this.response.set(value)
      },
      error:(err:any)=> {
        this.response.set(err.error)
      }
    }
    )
  }
}
