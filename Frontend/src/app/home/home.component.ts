import { Component, effect, ElementRef, HostListener, OnInit, signal, ViewChild } from '@angular/core';
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
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  products = signal<Array<Product> | null>([])
  pageNumber = signal<number>(1)
  totalPage ?:number

  constructor(private product:ProductService){
    
  }
  
  ngOnInit(): void {
    this.fetchProducts(this.pageNumber())
  }

  @HostListener('scroll',['$event'])
  onScroll(event:Event){
    const element = this.scrollContainer.nativeElement
    const atBottom = this.isAtBottom(element)
    if(atBottom){
      if (this.totalPage && (this.pageNumber() < this.totalPage)) {
        this.pageNumber.update(prev=>prev+1)
        this.fetchProducts(this.pageNumber())
      }
     
    }
  }
  isAtBottom(element:HTMLElement):boolean{
    const scrollTop = element.scrollTop //how far user scroll
    const scrollHeight = element.scrollHeight //scrollable height
    const clientHeight = element.clientHeight //container height
    return scrollTop+clientHeight >= scrollHeight - 10
  }
  fetchProducts(pageNumber:number){
    this.product.fetchProducts(pageNumber).subscribe({
      next:(value:any)=>{
        this.totalPage = value.totalPages
        this.products.update((current:any)=>[...current,...value.products])
      },
      error:(err:any)=> {
        this.products.set(err.error)
      }
    }
    )
  }
}
