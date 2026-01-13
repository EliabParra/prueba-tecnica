import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { StockService } from '../../core/services/stock.service';
import { StockDisplay } from '../../core/interfaces/Stock';
import { StockFormComponent } from '../../core/components/forms/stock-form/stock-form.component';
import { FormBuilder, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit {

  constructor(
    private navigationService: NavigationService,
    public dialog: MatDialog,
    public stockService: StockService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Inventario')
    this.stockService.stocksDisplay$.subscribe(list => {
      this.stocksDisplay = list
      this.allStocksDisplay = list
    })
  }

  stocksDisplay: StockDisplay[] = []
  allStocksDisplay: StockDisplay[] = []

  filterForm = this.fb.group({
    search: [''],
    sort: ['id']
  })

  get search(): AbstractControl {
    return this.filterForm.get('search')
  }

  get sort(): AbstractControl {
    return this.filterForm.get('sort')
  }

  // search(e: Event) {
  //   const input: HTMLInputElement = e.target as HTMLInputElement
  //   const q = input.value.trim().toLowerCase()
  //   if (!q) {
  //     this.stocksDisplay = [...this.allStocksDisplay]
  //     return
  //   }
  //   this.stocksDisplay = this.allStocksDisplay.filter(stock => stock.store.name.toLowerCase().includes(q) || stock.product.name.toLowerCase().includes(q))
  // }

  // sort(e: Event) {
  //   const select: HTMLSelectElement = e.target as HTMLSelectElement
  //   const sortBy = select.value
  //   this.stocksDisplay.sort((a, b) => {
  //     if (a[sortBy] < b[sortBy]) return -1
  //     if (a[sortBy] > b[sortBy]) return 1
  //     return 0
  //   })
  // }

  openCreateStockModal() {
    const dialogRef = this.dialog.open(StockFormComponent, {
      width: '40rem',
      data: { store: '', product: '', quantity: 0, edit: false },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async stockDisplay => {
      if (
        stockDisplay
        && this.stockService.existsStore(stockDisplay.store)
        && this.stockService.existsProduct(stockDisplay.product)
      ) {
        const result = await this.stockService.addStock(stockDisplay)
        console.log('Registro guardado', result)
        console.log('Stock: ', this.stocksDisplay)
      }
    })
  }

  openEditStockModal(stockDisplay: StockDisplay) {
    const dialogRef = this.dialog.open(StockFormComponent, {
      width: '40rem',
      data: {...stockDisplay, edit: true},
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async stockDisplayForm => {
      if (stockDisplayForm) {
        const result = await this.stockService.updateStock(stockDisplayForm)
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
