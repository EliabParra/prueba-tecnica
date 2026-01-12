import { Component, OnInit } from '@angular/core'
import { NavigationService } from '../../core/services/navigation.service'
import { MatDialog } from '@angular/material/dialog'
import { ProductsService } from '../../core/products.service'
import { ProductsFormComponent } from '../../core/components/forms/products-form/products-form.component'
import { Product } from '../../core/interfaces/Product'

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  constructor(
    private navigationService: NavigationService,
    public dialog: MatDialog,
    public productsService: ProductsService
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Articulos')
    this.productsService.products$.subscribe(list => {
      this.products = list
      this.allProducts = list
    })
  }

  products: Product[] = []

  //solo para buscar al derecho y al reves
  allProducts: Product[] = []
  
  syncProducts() {
    this.products = this.productsService.getProducts()
  }

  search(e: Event) {
    const input: HTMLInputElement = e.target as HTMLInputElement
    const q = input.value.trim().toLowerCase()
    if (!q) {
      this.products = [...this.allProducts]
      return
    }
    this.products = this.allProducts.filter(product => product.name.toLowerCase().includes(q))
  }

  sort(e: Event) {
    const select: HTMLSelectElement = e.target as HTMLSelectElement
    const sortBy = select.value
    this.products.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1
      if (a[sortBy] > b[sortBy]) return 1
      return 0
    })
  }

  openCreateProductModal() {
    const dialogRef = this.dialog.open(ProductsFormComponent, {
      width: '40rem',
      data: { name: '', category: '' },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async product => {
      if (product) {
        const result = await this.productsService.addProduct(product)
        this.syncProducts()
        console.log('Producto guardado', result)
        console.log('Productos: ', this.products)
      }
    })
  }

  openEditProductModal(product: Product) {
    const dialogRef = this.dialog.open(ProductsFormComponent, {
      width: '40rem',
      data: product,
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async product => {
      if (product) {
        const result = await this.productsService.updateProduct(product)
        this.syncProducts()
        console.log('Producto actualizado', result)
        console.log('Productos: ', this.products)
      }
    })
  }

  async deleteProduct(id: string) {
    await this.productsService.deleteProduct(id)
    this.syncProducts()
    console.log('Producto eliminado', id)
    console.log('Productos: ', this.products)
  }
}
