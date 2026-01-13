import { Injectable } from '@angular/core';
import { Store } from '../interfaces/Store';
import { FireDBService } from './firedb.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoresService {

  constructor (
    private db: FireDBService
  ) {
    this.syncDB().then()
  }

  stores: Store[] = []

  private storesSubject = new BehaviorSubject<Store[]>([])
  public stores$ = this.storesSubject.asObservable()

  async syncDB() {
    const storesSnapshot = await this.db.getAll('stores')
    storesSnapshot.subscribe((storesData: any) => {
      this.stores = storesData.map((item: any) => {
        const data = item.payload.val()
        if ((!data || !data.id) && item.key) data.id = item.key
        return data as Store
      })
      this.storesSubject.next(this.stores)
    })
  }

  async addStore(store: Store): Promise<Store> {
    const storeResult: Store = await this.db.create('stores', store)
    await this.syncDB()
    return storeResult
  }

  getStores(): Store[] {
    return this.stores
  }

  async getStore(id: string): Promise<Store | undefined> {
    const store = this.stores.find(p => p.id === id)
    return store
  }

  async updateStore(store: Store): Promise<Store> {
    const storeResult: Store = await this.db.update('stores', store.id, store)
    await this.syncDB()
    return storeResult
  }

  async deleteStore(store: Store): Promise<string> {
    const deletedId: string = await this.db.delete('stores', store.id)
    await this.syncDB()
    return deletedId
  }
}
