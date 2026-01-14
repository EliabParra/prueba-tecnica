import { Component, OnInit, OnDestroy } from '@angular/core'
import { NavigationService } from '../../core/services/navigation.service'
import { MatDialog } from '@angular/material/dialog'
import { ProductsService } from '../../core/services/products.service'
import { ProductsFormComponent } from '../../core/components/forms/products-form/products-form.component'
import { Product } from '../../core/interfaces/Product';
import { StockService } from '../../core/services/stock.service';
import { FormBuilder, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {

  constructor(
    private navigationService: NavigationService,
    public dialog: MatDialog,
    public productsService: ProductsService,
    private stockService: StockService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Articulos')
    this.productsService.products$.subscribe(list => {
      this.allProducts = list
      this.applyFilter()
    })
    this.subs.push(this.filterForm.get('search').valueChanges.subscribe(() => this.applyFilter()))
    this.subs.push(this.filterForm.get('sort').valueChanges.subscribe(() => this.applyFilter()))
  }

  products: Product[] = []
  allProducts: Product[] = []
  filteredProducts: Product[] = []

  // paginator
  pageIndex = 0
  pageSize = 10
  pageSizeOptions = [5, 10, 25]

  filterForm = this.fb.group({
    search: [''],
    sort: ['id']
  })

  get search(): AbstractControl { return this.filterForm.get('search') }
  get sort(): AbstractControl { return this.filterForm.get('sort') }

  searchInput(e: Event) { this.search.setValue((e.target as HTMLInputElement).value) }

  sortChange(e: Event) { this.sort.setValue((e.target as HTMLSelectElement).value) }

  openCreateProductModal() {
    const dialogRef = this.dialog.open(ProductsFormComponent, {
      width: '40rem',
      data: { name: '', category: '' },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async product => {
      if (product) {
        if (this.stockService.existsProduct(product)) return
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
    this.applyFilter()
  }

  private subs: Subscription[] = []

  private applyFilter() {
    const q = (this.search.value || '').toString().trim().toLowerCase()
    if (!q) {
      this.filteredProducts = [...this.allProducts]
    } else {
      this.filteredProducts = this.allProducts.filter(p => p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q))
    }
    const sortBy = (this.sort.value || 'id').toString()
    this.filteredProducts.sort((a, b) => {
      let av: any = a[sortBy]
      let bv: any = b[sortBy]
      if (av == null) av = ''
      if (bv == null) bv = ''
      av = typeof av === 'string' ? av.toLowerCase() : av
      bv = typeof bv === 'string' ? bv.toLowerCase() : bv
      if (av < bv) return -1
      if (av > bv) return 1
      return 0
    })
    this.pageIndex = 0
    this.updatePaged()
  }

  updatePaged() {
    const start = this.pageIndex * this.pageSize
    this.products = this.filteredProducts.slice(start, start + this.pageSize)
  }

  onPage(e: PageEvent) {
    this.pageIndex = e.pageIndex
    this.pageSize = e.pageSize
    this.updatePaged()
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe())
  }
}
