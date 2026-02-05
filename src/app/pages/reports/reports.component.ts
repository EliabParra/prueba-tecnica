import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ReportsService } from '../../core/services/reports/reports.service';
import { InventoryReportDTO } from '../../core/interfaces/api/inventory';
import { ProductsService } from '../../core/services/products.service';
import { WarehousesService } from '../../core/services/warehouses.service';
import { Product } from '../../core/interfaces/Product';
import { Warehouse } from '../../core/interfaces/Warehouse';
import { NavigationService } from '../../core/services/navigation.service';
import { AlertsService } from '../../core/services/alerts.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, AfterViewInit {
  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private productsService: ProductsService,
    private warehousesService: WarehousesService,
    private navigationService: NavigationService,
    private alertsService: AlertsService
  ) {}

  products: Product[] = []
  warehouses: Warehouse[] = []
  report: InventoryReportDTO[] = []
  dataSource = new MatTableDataSource<InventoryReportDTO>([])
  displayedColumns: string[] = ['productCode', 'productDescription', 'movementNumber', 'movementType', 'warehouse', 'quantity']
  @ViewChild(MatPaginator)
  set matPaginator(paginator: MatPaginator) {
    if (paginator) this.dataSource.paginator = paginator
  }

  @ViewChild(MatSort)
  set matSort(sort: MatSort) {
    if (sort) this.dataSource.sort = sort
  }
  loading = false

  filtersForm = this.fb.group({
    productId: [0, [Validators.required, Validators.min(1)]],
    warehouseId: [0]
  })

  get productId(): AbstractControl { return this.filtersForm.get('productId') }
  get warehouseId(): AbstractControl { return this.filtersForm.get('warehouseId') }

  ngOnInit(): void {
    this.navigationService.setTitle('Reportes')
    this.productsService.products$.subscribe(list => this.products = list)
    this.warehousesService.warehouses$.subscribe(list => this.warehouses = list)
    this.filtersForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadReport(false))
  }

  loadProducts(opened: boolean) {
    if (opened) this.productsService.syncDB().then()
  }

  loadWarehouses(opened: boolean) {
    if (opened) this.warehousesService.syncDB().then()
  }

  ngAfterViewInit(): void {}

  async loadReport(showValidationAlert = true) {
    this.loading = true
    try {
      if (this.filtersForm.invalid) {
        if (showValidationAlert) {
          this.alertsService.showAlert({ type: 'error', title: 'Error', message: 'Selecciona un producto para generar el reporte' })
        }
        return
      }
      const productId = Number(this.productId.value) || undefined
      const warehouseId = Number(this.warehouseId.value) || undefined
      this.report = await this.reportsService.getInventoryReport(productId, warehouseId).toPromise()
      this.dataSource.data = this.report
      if (this.dataSource.paginator) this.dataSource.paginator.firstPage()
    } catch {
      this.alertsService.showAlert({ type: 'error', title: 'Error', message: 'No se pudo cargar el reporte' })
    } finally {
      this.loading = false
    }
  }

  async downloadExcel() {
    try {
      if (!Number(this.productId.value)) {
        this.alertsService.showAlert({ type: 'error', title: 'Error', message: 'Selecciona un producto para descargar el reporte' })
        return
      }
      const productId = Number(this.productId.value) || undefined
      const warehouseId = Number(this.warehouseId.value) || undefined
      const blob = await this.reportsService.downloadInventoryExcel(productId, warehouseId).toPromise()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'reporte-inventario.xlsx'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      this.alertsService.showAlert({ type: 'error', title: 'Error', message: 'No se pudo descargar el reporte' })
    }
  }
}
