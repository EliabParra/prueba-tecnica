import { Component, OnInit } from '@angular/core'
import { NavigationService } from '../../core/services/navigation.service'
import { MatDialog } from '@angular/material/dialog'
import { ProductsService } from '../../core/services/products.service'
import { ProductsFormComponent } from '../../core/components/forms/products-form/products-form.component'
import { Product } from '../../core/interfaces/Product';
import { StockService } from '../../core/services/stock.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  constructor(
    private navigationService: NavigationService,
    public dialog: MatDialog,
    public productsService: ProductsService,
    private stockService: StockService
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Articulos')
    this.productsService.products$.subscribe(list => {
      this.products = list
    })
  }

  products: Product[] = []

  search(e: Event) {
    const input: HTMLInputElement = e.target as HTMLInputElement
    const allProducts = this.products
    const q = input.value.trim().toLowerCase()
    if (!q) {
      this.products = [...allProducts]
      return
    }
    this.products = allProducts.filter(product => product.name.toLowerCase().includes(q))
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
        console.log('Producto actualizado', result)
        console.log('Productos: ', this.products)
      }
    })
  }

  async deleteProduct(product: Product): Promise<boolean> {
    if (this.stockService.existsInStocks(product)) return false
    await this.productsService.deleteProduct(product)
    console.log('Producto eliminado', product.id)
    console.log('Productos: ', this.products)
  }
}
