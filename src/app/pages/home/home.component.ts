import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StockService } from '../../core/services/stock.service';
import { StoresService } from '../../core/services/stores.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DashboardBottomSheetComponent } from '../../core/components/dashboard-bottom-sheet/dashboard-bottom-sheet.component';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/interfaces/Product';
import { Store } from '../../core/interfaces/Store';
import { StockDisplay } from '../../core/interfaces/Stock';
import Chart from 'chart.js';
import { AlertsService } from '../../core/services/alerts.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('storesChart') storesChartRef!: ElementRef<HTMLCanvasElement>;
  private storesChart!: Chart;

  constructor(
    private navigationService: NavigationService,
    private stockService: StockService,
    private storesService: StoresService,
    private productsService: ProductsService,
    private bottomSheet: MatBottomSheet,
    public alertsService: AlertsService
  ) { }

  products: Product[] = []
  stores: Store[] = []
  stock: StockDisplay[] = []
  stats$: Observable<any>
  inventorySummary$: Observable<any>
  topProducts$: Observable<any>

  ngOnInit(): void {
    this.navigationService.setTitle('Dashboard')
    this.stats$ = combineLatest([
      this.productsService.products$,
      this.storesService.stores$,
      this.stockService.stocksDisplay$
    ]).pipe(
      map(([products, stores, stocks]) => {
        return [
          { label: 'Productos', value: products.length, icon: 'shopping_basket' },
          { label: 'Almacenes', value: stores.length, icon: 'store' },
          { label: 'Stock', value: stocks.length, icon: 'inventory' },
        ]
      })
    )

    this.inventorySummary$ = combineLatest([
      this.stockService.stocksDisplay$,
      this.productsService.products$,
      this.storesService.stores$
    ]).pipe(
      map(([stocks, products, stores]) => {
        // count products that are not associated to any store in stocks
        const associated = new Set<string>();
        (stocks || []).forEach(s => { if (s && s.product && s.product.id) associated.add(s.product.id) });
        const productsWithoutAssociation = (products || []).filter(p => !associated.has(p.id || '')).length;

        return [
          { label: 'Unidades totales', value: (stocks || []).reduce((s, it) => s + (it.quantity || 0), 0) },
          { label: 'Almacenes totales', value: (stores || []).length },
          { label: 'Productos sin stock', value: productsWithoutAssociation }
        ]
      })
    )

    this.topProducts$ = this.stockService.stocksDisplay$.pipe(
      map(stocks => {
        const totals = new Map<string, number>();
        stocks
          .filter(s => s && s.product && typeof s.quantity === 'number')
          .forEach(s => {
            const name = s.product.name;
            totals.set(name, (totals.get(name) || 0) + (s.quantity || 0));
          });
        const items = Array.from(totals.entries()).map(([name, qty]) => ({ name, qty }));
        items.sort((a, b) => b.qty - a.qty);
        return items.slice(0, 5).map(item => {
          return { name: item.name, qty: item.qty };
        });
      })
    )
  }

  ngAfterViewInit(): void {
    this.storesChart = new Chart(this.storesChartRef.nativeElement.getContext('2d')!, {
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

    // Observable que agrega quantities por tienda
    combineLatest([this.stockService.stocksDisplay$, this.storesService.stores$]).pipe(
      map(([stocksDisplay, stores]) => {
        // Map storeId -> total qty
        const totals = new Map<string, number>();
        stocksDisplay
          .filter(s => s && s.store && typeof s.quantity === 'number')
          .forEach(s => {
            const id = s.store.id || s.store.name;
            totals.set(id, (totals.get(id) || 0) + (s.quantity || 0));
          });

        // Asegurar incluir tiendas sin stock (total 0)
        stores.forEach(store => {
          const id = store.id || store.name;
          if (!totals.has(id)) totals.set(id, 0);
        });

        // Convertir a arrays ordenados (opcional: ordenar desc)
        const items = Array.from(totals.entries()).map(([id, qty]) => {
          const store = stores.find(s => (s.id || s.name) === id);
          return { id, name: store ? store.name : id, qty };
        });
        items.sort((a, b) => b.qty - a.qty);

        return items;
      })
    ).subscribe(items => {
      const labels = items.map(i => i.name);
      const data = items.map(i => i.qty);
      const palette = ['#1976d2','#4caf50','#ffb300','#e53935','#7b1fa2','#00bcd4','#ff7043','#9e9e9e'];
      const colors = labels.map((_, idx) => this.hexToRgba(palette[idx % palette.length], 0.9));
      const borders = labels.map((_, idx) => this.hexToRgba('#000000', 0.08));

      // Actualiza chart
      this.storesChart.data.labels = labels;
      this.storesChart.data.datasets = [{ label: 'Cantidad total', data, backgroundColor: colors, borderColor: borders, borderWidth: 1 }];
      this.storesChart.update();
    });
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
}
