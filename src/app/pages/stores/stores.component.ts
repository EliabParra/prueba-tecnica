import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { StoresService } from '../../core/services/stores.service';
import { Store } from '../../core/interfaces/Store';
import { StoresFormComponent } from '../../core/components/forms/stores-form/stores-form.component';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss']
})
export class StoresComponent implements OnInit {

  constructor(
    private navigationService: NavigationService,
    public dialog: MatDialog,
    public storesService: StoresService
  ) { }

  ngOnInit(): void {
    this.navigationService.setTitle('Almacenes')
    this.storesService.stores$.subscribe(list => {
      this.stores = list
      this.allStores = list
    })
  }

  stores: Store[] = []
  //solo para buscar al derecho y al reves
  allStores: Store[] = []

  syncStores() {
    this.stores = this.storesService.getStores()
  }

  search(e: Event) {
    const input: HTMLInputElement = e.target as HTMLInputElement
    const q = input.value.trim().toLowerCase()
    if (!q) {
      this.stores = [...this.allStores]
      return
    }
    this.stores = this.allStores.filter(store => store.name.toLowerCase().includes(q))
  }

  sort(e: Event) {
    const select: HTMLSelectElement = e.target as HTMLSelectElement
    const sortBy = select.value
    this.stores.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1
      if (a[sortBy] > b[sortBy]) return 1
      return 0
    })
  }

  openCreateStoreModal() {
    const dialogRef = this.dialog.open(StoresFormComponent, {
      width: '40rem',
      data: { name: '', location: '' },
      autoFocus: false
    })
    dialogRef.afterClosed().subscribe(async store => {
      if (store) {
        const result = await this.storesService.addStore(store)
        this.syncStores()
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
        this.syncStores()
        console.log('Almacén actualizado', result)
        console.log('Almacenes: ', this.stores)
      }
    })
  }

  async deleteStore(id: string) {
    await this.storesService.deleteStore(id)
    this.syncStores()
    console.log('Almacén eliminado', id)
    console.log('Almacenes: ', this.stores)
  }

}
