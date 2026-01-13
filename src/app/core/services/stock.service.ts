import { Injectable } from '@angular/core';
import { FireDBService } from './firedb.service';
import { ProductsService } from './products.service';
import { StoresService } from './stores.service';
import { BehaviorSubject } from 'rxjs';
import { Stock, StockDisplay } from '../interfaces/Stock';
import { Product } from '../interfaces/Product';
import { Store } from '../interfaces/Store';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor (
    private db: FireDBService,
    private productsService: ProductsService,
    private storesService: StoresService
  ) {
    this.syncDB().then()
    this.productsService.products$.subscribe(list => {
      this.products = list
    })
    this.storesService.stores$.subscribe(list => {
      this.stores = list
    })
  }

  stocks: Stock[] = []
  stocksDisplay: StockDisplay[] = []
  products: Product[] = []
  stores: Store[] = []

  private stocksSubject = new BehaviorSubject<Stock[]>([])
  public stocks$ = this.stocksSubject.asObservable()
  private stocksDisplaySubject = new BehaviorSubject<StockDisplay[]>([])
  public stocksDisplay$ = this.stocksDisplaySubject.asObservable()

  async syncDB() {
    const stocksSnapshot = await this.db.getAll('stocks')
    stocksSnapshot.subscribe((stocksData: any) => {

      this.stocks = stocksData.map((item: any) => {
        const data = item.payload.val()
        if ((!data || !data.id) && item.key) data.id = item.key
        return data as Stock
      })

      this.stocksDisplay = this.stocks.map(stock => {
        const product: Product = this.products.find(p => p.id === stock.productId)
        const store: Store = this.stores.find(s => s.id === stock.storeId)
        return this.buildStockDisplay(stock, product, store)
      })

      this.stocksSubject.next(this.stocks)
      this.stocksDisplaySubject.next(this.stocksDisplay)
    })
  }

  getStocks(): StockDisplay[] {
    return this.stocksDisplay
  }

  async addStock(stockDisplay: StockDisplay): Promise<Stock | false> {
    const stock: Stock = this.buildStockFromStockDisplay(stockDisplay)
    if (!this.validateCreateStock(stock)) return false
    console.log('stockDisplay de addStock', stockDisplay);
    if (this.existsStock(stock)) return this.updateStock(stockDisplay)
    const stockResult: Stock = await this.db.create('stocks', stock)
    await this.syncDB()
    return stockResult
  }

  async updateStock(stockDisplay: StockDisplay): Promise<Stock | false> {
    const stock: Stock = this.buildStockFromStockDisplay(stockDisplay)
    if (!this.validateUpdateStock(stock)) return false
    const stockResult: Stock = await this.db.update('stocks', stock.id, stock)
    await this.syncDB()
    return stockResult
  }

  async deleteStock(stockDisplay: StockDisplay): Promise<Stock | false> {
    stockDisplay.quantity = 0
    return await this.updateStock(stockDisplay)
  }

  buildStockFromStockDisplay(stockDisplay: StockDisplay): Stock {
    if (stockDisplay.id) {
      return {
        id: stockDisplay.id,
        productId: stockDisplay.product.id,
        storeId: stockDisplay.store.id,
        quantity: stockDisplay.quantity
      } as Stock
    } else {
      return {
        productId: stockDisplay.product.id,
        storeId: stockDisplay.store.id,
        quantity: stockDisplay.quantity
      } as Stock
    }
  }

  buildStockDisplay(stock: Stock, product: Product, store: Store): StockDisplay {
    return {
      id: stock.id,
      store: store,
      product: product,
      quantity: stock.quantity
    } as StockDisplay
  }

  validateCreateStock(stock: Stock): boolean {
    let valid = true
    if (!stock.productId) valid = false
    if (!stock.storeId) valid = false
    if (!stock.quantity) stock.quantity = 0
    if (stock.quantity < 0) valid = false
    return valid
  }

  validateUpdateStock(stock: Stock): boolean {
    let valid = true
    if (this.existsStock(stock)) {
      stock.id = this.stocks.find(
        s => s.productId === stock.productId && s.storeId === stock.storeId
      ).id
      if (!stock.id) valid = false
    }
    if (!stock.productId) valid = false
    if (!stock.storeId) valid = false
    if (!stock.quantity) valid = false
    if (stock.quantity < 0) valid = false
    return valid
  }

  existsStock(stock: Stock): boolean {
    return this.stocks.some(s => s.productId === stock.productId && s.storeId === stock.storeId)
  }

  existsInStocks(item: Store | Product): boolean {
    return this.stocks.some(s => s.productId === item.id || s.storeId === item.id)
  }

  existsStore(store: Store): boolean {
    return this.stores.some(s => s.name === store.name)
  }

  existsProduct(product: Product): boolean {
    return this.products.some(p => p.name === product.name)
  }
}
