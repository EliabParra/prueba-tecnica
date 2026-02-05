import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { WarehousesService } from '../../core/services/warehouses.service';
import { Warehouse } from '../../core/interfaces/Warehouse';
import { WarehousesFormComponent } from '../../core/components/forms/warehouses-form/warehouses-form.component';
import { StockService } from '../../core/services/stock.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AlertsService } from '../../core/services/alerts.service';
import { ConfirmDialogComponent } from '../../core/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-warehouses',
  templateUrl: './warehouses.component.html',
  styleUrls: ['./warehouses.component.scss']
})
export class WarehousesComponent implements OnInit, AfterViewInit {

  constructor(
    private navigationService: NavigationService,
    public dialog: MatDialog,
    public warehousesService: WarehousesService,
    private stockService: StockService,
    private alertsService: AlertsService
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Almacenes')
    this.warehousesService.syncDB().then()
    this.warehousesService.warehouses$.subscribe(list => {
      this.dataSource.data = list
      this.dataSource.filter = ''
    })
    this.dataSource.filterPredicate = (data, filter) => {
      const q = filter.trim().toLowerCase()
      if (!q) return true
      return data.name.toLowerCase().includes(q) || (data.location || '').toLowerCase().includes(q)
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  dataSource = new MatTableDataSource<Warehouse>([])
  displayedColumns: string[] = ['id', 'name', 'location', 'actions']

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort


  openCreateWarehouseModal() {
    const dialogRef = this.dialog.open(WarehousesFormComponent, {
      width: '40rem',
      data: { name: '', location: '' },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async warehouse => {
      if (warehouse) {
        if (this.stockService.existsWarehouse(warehouse)) return
        const result = await this.warehousesService.addWarehouse(warehouse)
        console.log('Almacén guardado', result)
        console.log('Almacenes: ', this.dataSource.data)
      }
    })
  }

  openEditWarehouseModal(warehouse: Warehouse) {
    const dialogRef = this.dialog.open(WarehousesFormComponent, {
      width: '40rem',
      data: warehouse,
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async warehouse => {
      if (warehouse) {
        const result = await this.warehousesService.updateWarehouse(warehouse)
        console.log('Almacén actualizado', result)
        console.log('Almacenes: ', this.dataSource.data)
      }
    })
  }

  async deleteWarehouse(warehouse: Warehouse): Promise<void> {
    if (this.stockService.existsInStocks(warehouse)) {
      this.alertsService.showAlert({ type: 'error', title: 'Error', message: 'El almacén no puede eliminarse porque tiene articulos en stock' })
      return
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '28rem',
      data: {
        title: 'Eliminar almacén',
        message: `¿Seguro que deseas eliminar "${warehouse.name}"?`,
        confirmText: 'Eliminar'
      },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async confirmed => {
      if (!confirmed) return
      await this.warehousesService.deleteWarehouse(warehouse)
      console.log('Almacén eliminado', warehouse.id)
      console.log('Almacenes: ', this.dataSource.data)
      this.applyFilter(this.dataSource.filter)
    })
  }

  applyFilter(value: string) {
    this.dataSource.filter = (value || '').toString().trim().toLowerCase()
    if (this.paginator) this.paginator.firstPage()
  }
}
