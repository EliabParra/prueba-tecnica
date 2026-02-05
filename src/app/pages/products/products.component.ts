import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core'
import { NavigationService } from '../../core/services/navigation.service'
import { MatDialog } from '@angular/material/dialog'
import { ProductsService } from '../../core/services/products.service'
import { ProductsFormComponent } from '../../core/components/forms/products-form/products-form.component'
import { Product } from '../../core/interfaces/Product';
import { StockService } from '../../core/services/stock.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertsService } from '../../core/services/alerts.service';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, AfterViewInit {

  constructor(
    private navigationService: NavigationService,
    public dialog: MatDialog,
    public productsService: ProductsService,
    private stockService: StockService,
    private alertsService: AlertsService
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Articulos')
    this.productsService.syncDB().then()
    this.productsService.products$.subscribe(list => {
      this.dataSource.data = list
      this.dataSource.filter = ''
    })
    this.stockService.stocksDisplay$.subscribe(stocks => {
      this.stockTotals = {};
      (stocks || []).forEach(s => {
        const id = Number(s.product?.id)
        if (!id) return
        const key = String(id)
        this.stockTotals[key] = (this.stockTotals[key] || 0) + (s.quantity || 0)
      })
      this.dataSource.data = [...this.dataSource.data]
    })
    this.dataSource.filterPredicate = (data, filter) => {
      const q = filter.trim().toLowerCase()
      if (!q) return true
      return data.name.toLowerCase().includes(q)
        || (data.categoryName || '').toLowerCase().includes(q)
        || this.getStatus(data).toLowerCase().includes(q)
    }
    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'status') return this.getStatus(item).toLowerCase()
      return (item as any)[property]
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  dataSource = new MatTableDataSource<Product>([])
  displayedColumns: string[] = ['id', 'name', 'categoryName', 'status', 'actions']

  private stockTotals: Record<string, number> = {}

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  openCreateProductModal() {
    const dialogRef = this.dialog.open(ProductsFormComponent, {
      width: '40rem',
      data: { name: '', categoryId: 0, price: 0, unitOfMeasure: '', minStock: 0, description: '' },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async product => {
      if (product) {
        if (this.stockService.existsProduct(product)) return
        const result = await this.productsService.addProduct(product)
        console.log('Producto guardado', result)
        console.log('Productos: ', this.dataSource.data)
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
        console.log('Productos: ', this.dataSource.data)
      }
    })
  }

  async deleteProduct(product: Product): Promise<void> {
    if (this.stockService.existsInStocks(product)) {
      this.alertsService.showAlert({ type: 'error', title: 'Error', message: 'El producto no puede eliminarse porque está en stock' })
      return
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '28rem',
      data: {
        title: 'Eliminar producto',
        message: `¿Seguro que deseas eliminar "${product.name}"?`,
        confirmText: 'Eliminar'
      },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async confirmed => {
      if (!confirmed) return
      await this.productsService.deleteProduct(product)
      console.log('Producto eliminado', product.id)
      console.log('Productos: ', this.dataSource.data)
      this.applyFilter(this.dataSource.filter)
    })
  }

  applyFilter(value: string) {
    this.dataSource.filter = (value || '').toString().trim().toLowerCase()
    if (this.paginator) this.paginator.firstPage()
  }

  getStatus(product: Product): string {
    const min = Number(product.minStock || 0)
    const total = this.stockTotals[String(product.id)] || 0
    if (min > 0 && total < min) return 'Low stock'
    return 'In stock'
  }
}
