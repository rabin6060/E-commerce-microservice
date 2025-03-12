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
    this.product.fetchProducts(pageNumber,null,null,null).subscribe({
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
  handlePrice(){
    const selectItem1 = document.getElementById('min') as HTMLInputElement
    const minP =selectItem1.value
    const selectItem2 = document.getElementById('max') as HTMLInputElement
    const maxP =selectItem2.value
    console.log(minP,maxP)

    this.product.fetchProducts(1,null,null,{minP:+minP,maxP:+maxP}).subscribe({
      next:(value:any)=>{
        this.product.products.set(value.products)
      },
      error:(err)=> {
        console.log(err.error)
      },
    })
  }

  handleProduct(){
    const selectItem = document.getElementById('Categories') as HTMLSelectElement
    const category =selectItem && selectItem.value
    this.product.fetchProducts(1,null,category,null).subscribe({
      next:(value:any)=>{
        this.product.products.set(value.products)
      },
      error:(err)=> {
        console.log(err.error)
      },
    })
  }
}
