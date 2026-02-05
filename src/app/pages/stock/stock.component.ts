import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { StockService } from '../../core/services/stock.service';
import { StockDisplay } from '../../core/interfaces/Stock';
import { StockFormComponent } from '../../core/components/forms/stock-form/stock-form.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertsService } from '../../core/services/alerts.service';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, AfterViewInit {

  constructor(
    private navigationService: NavigationService,
    public dialog: MatDialog,
    public stockService: StockService,
    private alertsService: AlertsService
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Inventario')
    this.stockService.syncDB().then()
    this.stockService.stocksDisplay$.subscribe(list => {
      this.dataSource.data = list
      this.dataSource.filter = ''
    })
    this.dataSource.filterPredicate = (data, filter) => {
      const q = filter.trim().toLowerCase()
      if (!q) return true
      return data.warehouse.name.toLowerCase().includes(q) || data.product.name.toLowerCase().includes(q)
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  dataSource = new MatTableDataSource<StockDisplay>([])
  displayedColumns: string[] = ['id', 'warehouse', 'product', 'quantity', 'actions']

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort


  openCreateStockModal() {
    const dialogRef = this.dialog.open(StockFormComponent, {
      width: '40rem',
      data: { warehouse: null, product: null, quantity: 0, edit: false },
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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '28rem',
      data: {
        title: 'Eliminar inventario',
        message: `¿Seguro que deseas eliminar el stock de "${stockDisplay.product.name}" en "${stockDisplay.warehouse.name}"?`,
        confirmText: 'Eliminar'
      },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async confirmed => {
      if (!confirmed) return
      await this.stockService.deleteStock(stockDisplay)
    })
  }

  applyFilter(value: string) {
    this.dataSource.filter = (value || '').toString().trim().toLowerCase()
    if (this.paginator) this.paginator.firstPage()
  }

}
