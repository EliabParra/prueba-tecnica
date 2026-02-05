import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StockService } from '../../core/services/stock.service';
import { WarehousesService } from '../../core/services/warehouses.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DashboardBottomSheetComponent } from '../../core/components/dashboard-bottom-sheet/dashboard-bottom-sheet.component';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/interfaces/Product';
import { Warehouse } from '../../core/interfaces/Warehouse';
import { StockDisplay } from '../../core/interfaces/Stock';
import * as Chart from 'chart.js';
import { ReportsService } from '../../core/services/reports/reports.service';
import { InventoryReportDTO } from '../../core/interfaces/api/inventory';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('warehousesChart') warehousesChartRef!: ElementRef<HTMLCanvasElement>;
  private warehousesChart!: Chart;

  constructor(
    private navigationService: NavigationService,
    private stockService: StockService,
    private warehousesService: WarehousesService,
    private productsService: ProductsService,
    private bottomSheet: MatBottomSheet,
    private reportsService: ReportsService
  ) { }

  products: Product[] = []
  warehouses: Warehouse[] = []
  stock: StockDisplay[] = []
  stats$: Observable<any>
  recentMovements: InventoryReportDTO[] = []

  ngOnInit(): void {
    this.navigationService.setTitle('Dashboard')
    this.productsService.syncDB().then()
    this.warehousesService.syncDB().then()
    this.stockService.syncDB().then()
    this.stats$ = combineLatest([
      this.productsService.products$,
      this.warehousesService.warehouses$,
      this.stockService.stocksDisplay$
    ]).pipe(
      map(([products, warehouses, stocks]) => {
        const totalsByProduct = new Map<number, number>()
        ;(stocks || []).forEach(s => {
          const id = Number(s.product?.id)
          if (!id) return
          totalsByProduct.set(id, (totalsByProduct.get(id) || 0) + (s.quantity || 0))
        })
        const lowStockCount = (products || []).filter(p => {
          const min = Number(p.minStock || 0)
          if (!min) return false
          const qty = totalsByProduct.get(Number(p.id)) || 0
          return qty < min
        }).length

        const totalStock = (stocks || []).reduce((sum, it) => sum + (it.quantity || 0), 0)

        return [
          { label: 'Total Products', value: products.length, icon: 'inventory_2' },
          { label: 'Total Stock', value: totalStock, icon: 'inventory' },
          { label: 'Low / Stock', value: lowStockCount, icon: 'warning' },
          { label: 'Total Warehouses', value: warehouses.length, icon: 'warehouse' }
        ]
      })
    )

    this.loadRecentMovements()
  }

  ngAfterViewInit(): void {
    this.warehousesChart = new Chart(this.warehousesChartRef.nativeElement.getContext('2d')!, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Cantidad total',
          data: [],
          backgroundColor: [],
          borderColor: 'rgba(0,0,0,0.08)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { display: false },
        layout: { padding: { top: 8, right: 8, left: 8, bottom: 8 } },
        scales: {
          xAxes: [{
            ticks: { autoSkip: false },
            gridLines: { display: false }
          }],
          yAxes: [{
            ticks: { beginAtZero: true, precision: 0 },
            gridLines: { color: 'rgba(0,0,0,0.06)' }
          }]
        },
        tooltips: { mode: 'index', intersect: false }
      }
    });

    // Stock por categoría
    combineLatest([this.stockService.stocksDisplay$, this.productsService.products$]).pipe(
      map(([stocksDisplay, products]) => {
        const byCategory = new Map<string, number>()
        const productIndex = new Map<number, Product>()
        products.forEach(p => { if (p.id != null) productIndex.set(Number(p.id), p) })

        stocksDisplay
          .filter(s => s && s.product && typeof s.quantity === 'number')
          .forEach(s => {
            const product = productIndex.get(Number(s.product.id)) || s.product
            const category = product?.categoryName || 'Sin categoría'
            byCategory.set(category, (byCategory.get(category) || 0) + (s.quantity || 0))
          })

        const items = Array.from(byCategory.entries()).map(([name, qty]) => ({ name, qty }))
        items.sort((a, b) => b.qty - a.qty)
        return items
      })
    ).subscribe(items => {
      const labels = items.map(i => i.name)
      const data = items.map(i => i.qty)
      const palette = ['#1976d2','#4caf50','#ffb300','#e53935','#7b1fa2','#00bcd4','#ff7043','#9e9e9e']
      const colors = labels.map((_, idx) => this.hexToRgba(palette[idx % palette.length], 0.9))
      const borders = labels.map(() => this.hexToRgba('#000000', 0.08))

      this.warehousesChart.data.labels = labels
      this.warehousesChart.data.datasets = [{ label: 'Stock por categoría', data, backgroundColor: colors, borderColor: borders, borderWidth: 1 }]
      this.warehousesChart.update()
    })
  }

  private hexToRgba(hex: string, alpha = 1): string {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  openDashboardBottomSheet() {
    this.bottomSheet.open(DashboardBottomSheetComponent)
  }

  private async loadRecentMovements() {
    try {
      const data = await this.reportsService.getInventoryReport().toPromise()
      const items = (data || []).slice().sort((a, b) => (b.movementNumber || 0) - (a.movementNumber || 0))
      this.recentMovements = items.slice(0, 5)
    } catch {
      this.recentMovements = []
    }
  }

  formatMovement(item: InventoryReportDTO): string {
    const product = item.productDescription || `Producto ${item.productCode}`
    const warehouse = item.warehouse || 'Almacén'
    const type = item.movementType || 'MOV'
    return `${type} de ${item.quantity} en ${warehouse} (${product})`
  }
}
