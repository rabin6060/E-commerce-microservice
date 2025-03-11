import { Component, effect, ElementRef, HostListener, OnInit, Signal, signal, ViewChild } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { ProductItemComponent } from "../components/product-item/product-item.component";

@Component({
  selector: 'app-home',
  imports: [ProductItemComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  pageNumber = signal<number>(1)
  

  constructor(private product:ProductService){
   
  }
  ngAfterViewInit() {
    this.scrollContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
  }
  
  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    const element = this.scrollContainer.nativeElement;
    const atBottom = this.isAtBottom(element);
    const totalPage = this.product.getTotalPages()
    if (atBottom && totalPage && this.pageNumber() < totalPage) {
      this.pageNumber.update(prev => prev + 1);
      this.fetchProducts(this.pageNumber());
    }
  }
  isAtBottom(element:HTMLElement):boolean{
    const scrollTop = element.scrollTop //how far user scroll
    const scrollHeight = element.scrollHeight //scrollable height
    const clientHeight = element.clientHeight //container height
    return scrollTop+clientHeight >= scrollHeight - 10
  }
  fetchProducts(pageNumber:number){
    this.product.fetchProducts(pageNumber,null).subscribe({
      next:(value:any)=>{
      
        this.product.products.update((current:any)=>[...current,...value.products])
      },
      error:(err:any)=> {
        this.product.products.set(err.error)
      }
    }
    )
  }
  Products(){
    return this.product.products()
  }
  MyProducts(){
    this.product.fetchProductOfUser().subscribe({
      next:(value:any)=>{
        this.product.products.set(value)
      },
      error:(err:any)=> {
        this.product.products.set(err.error)
      }
    })
  }
}
