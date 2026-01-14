import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { StockService } from '../../core/services/stock.service';
import { StockDisplay } from '../../core/interfaces/Stock';
import { StockFormComponent } from '../../core/components/forms/stock-form/stock-form.component';
import { FormBuilder, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AlertsService } from '../../core/services/alerts.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, OnDestroy {

  constructor(
    private navigationService: NavigationService,
    public dialog: MatDialog,
    public stockService: StockService,
    private alertsService: AlertsService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Inventario')
    this.stockService.stocksDisplay$.subscribe(list => {
      this.allStocksDisplay = list
      this.applyFilter()
    })
    // subscribe to search and sort controls
    this.subs.push(
      this.search.valueChanges.subscribe(() => this.applyFilter())
    )
    this.subs.push(
      this.sort.valueChanges.subscribe(() => this.applyFilter())
    )
  }

  stocksDisplay: StockDisplay[] = []
  allStocksDisplay: StockDisplay[] = []
  filteredDisplay: StockDisplay[] = []
  // paginator
  pageIndex = 0
  pageSize = 10
  pageSizeOptions = [5, 10, 25]

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

  openCreateStockModal() {
    const dialogRef = this.dialog.open(StockFormComponent, {
      width: '40rem',
      data: { store: '', product: '', quantity: 0, edit: false },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async stockDisplay => {
      if (stockDisplay) await this.stockService.addStock(stockDisplay)
    })
  }

  openEditStockModal(stockDisplay: StockDisplay) {
    const dialogRef = this.dialog.open(StockFormComponent, {
      width: '40rem',
      data: {...stockDisplay, edit: true},
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async stockDisplay => {
      if (stockDisplay) await this.stockService.updateStock(stockDisplay)
    })
  }

  async deleteStock(stockDisplay: StockDisplay) {
    await this.stockService.deleteStock(stockDisplay)
  }

  private subs: Subscription[] = []

  private applyFilter() {
    const q = (this.search.value || '').toString().trim().toLowerCase()
    // filter
    if (!q) {
      this.filteredDisplay = [...this.allStocksDisplay]
    } else {
      this.filteredDisplay = this.allStocksDisplay.filter(s =>
        s.store.name.toLowerCase().includes(q) || s.product.name.toLowerCase().includes(q)
      )
    }
    // sort
    const sortBy = (this.sort.value || 'id').toString()
    this.filteredDisplay.sort((a, b) => {
      let av: any = a[sortBy]
      let bv: any = b[sortBy]
      if (sortBy === 'store') { av = a.store.name; bv = b.store.name }
      if (sortBy === 'product') { av = a.product.name; bv = b.product.name }
      if (av == null) av = ''
      if (bv == null) bv = ''
      av = typeof av === 'string' ? av.toLowerCase() : av
      bv = typeof bv === 'string' ? bv.toLowerCase() : bv
      if (av < bv) return -1
      if (av > bv) return 1
      return 0
    })

    // reset to first page when filter changes
    this.pageIndex = 0
    this.updatePaged()
  }

  updatePaged() {
    const start = this.pageIndex * this.pageSize
    this.stocksDisplay = this.filteredDisplay.slice(start, start + this.pageSize)
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
