import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { ProductsService } from '../../core/services/products.service';
import { StockService } from '../../core/services/stock.service';
import { Stock, StockDisplay } from '../../core/interfaces/Stock';
import { StockFormComponent } from '../../core/components/forms/stock-form/stock-form.component';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {

  constructor(
    private navigationService: NavigationService,
    public dialog: MatDialog,
    public stockService: StockService
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Inventario')
    this.stockService.stocksDisplay$.subscribe(list => {
      this.stocksDisplay = list
    })
  }

  stocksDisplay: StockDisplay[] = []
  search(e: Event) {
    const input: HTMLInputElement = e.target as HTMLInputElement
    const allStocks = this.stocksDisplay
    const q = input.value.trim().toLowerCase()
    if (!q) {
      this.stocksDisplay = [...allStocks]
      return
    }
    this.stocksDisplay = allStocks.filter(stock => stock.store.name.toLowerCase().includes(q) || stock.product.name.toLowerCase().includes(q))
  }

  sort(e: Event) {
    const select: HTMLSelectElement = e.target as HTMLSelectElement
    const sortBy = select.value
    this.stocksDisplay.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1
      if (a[sortBy] > b[sortBy]) return 1
      return 0
    })
  }

  openCreateStockModal() {
    const dialogRef = this.dialog.open(StockFormComponent, {
      width: '40rem',
      data: { store: '', product: '' },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async stock => {
      if (stock) {
        const result = await this.stockService.addStock(stock)
        console.log('Producto guardado', result)
        console.log('Productos: ', this.stocksDisplay)
      }
    })
  }

  openEditStockModal(stock: Stock) {
    const dialogRef = this.dialog.open(StockFormComponent, {
      width: '40rem',
      data: stock,
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async stock => {
      if (stock) {
        const result = await this.stockService.updateStock(stock)
        console.log('Producto actualizado', result)
        console.log('Productos: ', this.stocksDisplay)
      }
    })
  }

  async deleteStock(stockDisplay: StockDisplay) {
    await this.stockService.deleteStock(stockDisplay)
    console.log('Producto eliminado', stockDisplay.id)
    console.log('Productos: ', this.stocksDisplay)
  }

}
