import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { StoresService } from '../../core/services/stores.service';
import { Store } from '../../core/interfaces/Store';
import { StoresFormComponent } from '../../core/components/forms/stores-form/stores-form.component';
import { StockService } from '../../core/services/stock.service';
import { FormBuilder, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AlertsService } from '../../core/services/alerts.service';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss']
})
export class StoresComponent implements OnInit, OnDestroy {

  constructor(
    private navigationService: NavigationService,
    public dialog: MatDialog,
    public storesService: StoresService,
    private stockService: StockService,
    private fb: FormBuilder,
    private alertsService: AlertsService
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Almacenes')
    this.storesService.stores$.subscribe(list => {
      this.allStores = list
      this.applyFilter()
    })
    this.subs.push(this.filterForm.get('search').valueChanges.subscribe(() => this.applyFilter()))
    this.subs.push(this.filterForm.get('sort').valueChanges.subscribe(() => this.applyFilter()))
  }

  stores: Store[] = []
  allStores: Store[] = []
  filteredStores: Store[] = []

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

  openCreateStoreModal() {
    const dialogRef = this.dialog.open(StoresFormComponent, {
      width: '40rem',
      data: { name: '', location: '' },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async store => {
      if (store) {
        if (this.stockService.existsStore(store)) return
        const result = await this.storesService.addStore(store)
        console.log('Almacén guardado', result)
        console.log('Almacenes: ', this.stores)
      }
    })
  }

  openEditStoreModal(store: Store) {
    const dialogRef = this.dialog.open(StoresFormComponent, {
      width: '40rem',
      data: store,
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async store => {
      if (store) {
        const result = await this.storesService.updateStore(store)
        console.log('Almacén actualizado', result)
        console.log('Almacenes: ', this.stores)
      }
    })
  }

  async deleteStore(store: Store): Promise<void> {
    if (this.stockService.existsInStocks(store)) {
      this.alertsService.showAlert({ type: 'error', title: 'Error', message: 'El almacén no puede eliminarse porque tiene articulos en stock' })
      return
    }
    await this.storesService.deleteStore(store)
    console.log('Almacén eliminado', store.id)
    console.log('Almacenes: ', this.stores)
    this.applyFilter()
  }

  private subs: Subscription[] = []

  private applyFilter() {
    const q = (this.search.value || '').toString().trim().toLowerCase()
    if (!q) {
      this.filteredStores = [...this.allStores]
    } else {
      this.filteredStores = this.allStores.filter(s => s.name.toLowerCase().includes(q) || (s.location || '').toLowerCase().includes(q))
    }
    const sortBy = (this.sort.value || 'id').toString()
    this.filteredStores.sort((a, b) => {
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
    this.stores = this.filteredStores.slice(start, start + this.pageSize)
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
