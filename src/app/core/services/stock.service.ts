import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProductsService } from './products.service';
import { WarehousesService } from './warehouses.service';
import { Stock, StockDisplay } from '../interfaces/Stock';
import { Product } from '../interfaces/Product';
import { Warehouse } from '../interfaces/Warehouse';
import { AlertsService } from './alerts.service';
import { InventoryStockDTO, MovementRequestDTO, TransferRequestDTO } from '../interfaces/api/inventory';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor (
    private http: HttpClient,
    private productsService: ProductsService,
    private warehousesService: WarehousesService,
    private alertsService: AlertsService
  ) {
    this.productsService.products$.subscribe(list => {
      this.products = list
      this.rebuildStocksDisplay()
    })
    this.warehousesService.warehouses$.subscribe(list => {
      this.warehouses = list
      this.rebuildStocksDisplay()
    })
  }

  stocks: Stock[] = []
  stocksDisplay: StockDisplay[] = []
  products: Product[] = []
  warehouses: Warehouse[] = []

  private readonly baseUrl = `${environment.apiUrl}/api/inventory`
  private inventoryIndex = new Map<string, InventoryStockDTO>()

  private stocksSubject = new BehaviorSubject<Stock[]>([])
  public stocks$ = this.stocksSubject.asObservable()
  private stocksDisplaySubject = new BehaviorSubject<StockDisplay[]>([])
  public stocksDisplay$ = this.stocksDisplaySubject.asObservable()

  async syncDB() {
    try {
      const inventory = await this.http.get<InventoryStockDTO[]>(`${this.baseUrl}/stock`).toPromise()
      this.inventoryIndex.clear()
      this.stocks = (inventory || []).map(item => {
        const key = `${item.productId}-${item.warehouseId}`
        this.inventoryIndex.set(key, item)
        return {
          id: key,
          productId: item.productId,
          warehouseId: item.warehouseId,
          quantity: item.currentStock
        } as Stock
      })
      this.stocksSubject.next(this.stocks)
      this.rebuildStocksDisplay()
    } catch {
      this.inventoryIndex.clear()
      this.stocks = []
      this.stocksSubject.next([])
      this.rebuildStocksDisplay()
      this.alertsService.showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cargar el inventario'
      })
    }
  }

  private rebuildStocksDisplay() {
    this.stocksDisplay = this.stocks.map(stock => {
      const product: Product = this.products.find(p => p.id === stock.productId)
        ?? this.buildFallbackProduct(stock)
      const warehouse: Warehouse = this.warehouses.find(s => s.id === stock.warehouseId)
        ?? this.buildFallbackWarehouse(stock)
      return this.buildStockDisplay(stock, product, warehouse)
    })
    this.stocksDisplaySubject.next(this.stocksDisplay)
  }

  getStocks(): StockDisplay[] {
    return this.stocksDisplay
  }

  async addStock(stockDisplay: StockDisplay): Promise<Stock | false> {
    if (
      !this.existsProduct(stockDisplay.product)
      || !this.existsWarehouse(stockDisplay.warehouse)
    ) {
      this.alertsService.showAlert({
        type: 'error',
        title: 'Error al registrar inventario',
        message: 'El producto o almacen no existe'
      })
      return false
    }
    const stock: Stock = this.buildStockFromStockDisplay(stockDisplay)
    if (!this.validateCreateStock(stock)) {
      this.alertsService.showAlert({
        type: 'error',
        title: 'Error al registrar inventario',
        message: 'El inventario no es válido'
      })
      return false
    }
    if (this.existsStock(stock)) return this.updateStock(stockDisplay)
    const payload: MovementRequestDTO = {
      productId: Number(stock.productId),
      warehouseId: Number(stock.warehouseId),
      movementType: 'IN',
      quantity: stock.quantity,
      description: 'Alta de inventario'
    }
    const movementResult = await this.http.post(`${this.baseUrl}/movement`, payload).toPromise()
    if (movementResult) {
      this.alertsService.showAlert({
        type: 'success',
        title: 'Inventario registrado',
        message: `
          Producto ${stockDisplay.product.name} registrado en el almacen
          ${stockDisplay.warehouse.name} con exito
        `
      })
      await this.syncDB()
      return stock
    }
  }

  async updateStock(stockDisplay: StockDisplay): Promise<Stock | false> {
    const stock: Stock = this.buildStockFromStockDisplay(stockDisplay)
    if (!this.validateUpdateStock(stock)) {
      this.alertsService.showAlert({
        type: 'error',
        title: 'Error al actualizar inventario',
        message: 'El inventario no es válido'
      })
      return false
    }
    const current = this.stocks.find(s => s.productId === stock.productId && s.warehouseId === stock.warehouseId)
    const currentQty = current?.quantity ?? 0
    const delta = stock.quantity - currentQty
    if (delta === 0) return stock
    const payload: MovementRequestDTO = {
      productId: Number(stock.productId),
      warehouseId: Number(stock.warehouseId),
      movementType: delta > 0 ? 'IN' : 'OUT',
      quantity: Math.abs(delta),
      description: 'Ajuste de inventario'
    }
    const movementResult = await this.http.post(`${this.baseUrl}/movement`, payload).toPromise()
    if (movementResult) {
      this.alertsService.showAlert({
        type: 'success',
        title: 'Inventario actualizado',
        message: `
          Producto ${stockDisplay.product.name} en el almacen
          ${stockDisplay.warehouse.name} actualizado a ${stockDisplay.quantity}
          unidades con exito
        `
      })
      await this.syncDB()
      return stock
    }
  }

  async deleteStock(stockDisplay: StockDisplay): Promise<Stock | false> {
    const stock: Stock = this.buildStockFromStockDisplay(stockDisplay)
    const current = this.stocks.find(s => s.productId === stock.productId && s.warehouseId === stock.warehouseId)
    const currentQty = current?.quantity ?? 0
    if (currentQty <= 0) return stock
    const payload: MovementRequestDTO = {
      productId: Number(stock.productId),
      warehouseId: Number(stock.warehouseId),
      movementType: 'OUT',
      quantity: currentQty,
      description: 'Baja de inventario'
    }
    const movementResult = await this.http.post(`${this.baseUrl}/movement`, payload).toPromise()
    if (movementResult) {
      await this.syncDB()
      return stock
    }
    return false
  }

  async createMovement(payload: MovementRequestDTO) {
    const result = await this.http.post(`${this.baseUrl}/movement`, payload).toPromise()
    await this.syncDB()
    return result
  }

  async createTransfer(payload: TransferRequestDTO) {
    const result = await this.http.post(`${this.baseUrl}/transfer`, payload).toPromise()
    await this.syncDB()
    return result
  }

  buildStockFromStockDisplay(stockDisplay: StockDisplay): Stock {
    if (stockDisplay.id) {
      return {
        id: stockDisplay.id,
        productId: stockDisplay.product.id,
        warehouseId: stockDisplay.warehouse.id,
        quantity: stockDisplay.quantity
      } as Stock
    } else {
      return {
        productId: stockDisplay.product.id,
        warehouseId: stockDisplay.warehouse.id,
        quantity: stockDisplay.quantity
      } as Stock
    }
  }

  buildStockDisplay(stock: Stock, product: Product, warehouse: Warehouse): StockDisplay {
    return {
      id: stock.id,
      warehouse: warehouse,
      product: product,
      quantity: stock.quantity
    } as StockDisplay
  }

  private buildFallbackProduct(stock: Stock): Product {
    const key = `${stock.productId}-${stock.warehouseId}`
    const dto = this.inventoryIndex.get(key)
    return {
      id: stock.productId,
      name: dto?.productName ?? 'Producto',
      minStock: dto?.minStock,
      categoryName: null
    }
  }

  private buildFallbackWarehouse(stock: Stock): Warehouse {
    const key = `${stock.productId}-${stock.warehouseId}`
    const dto = this.inventoryIndex.get(key)
    return {
      id: stock.warehouseId,
      name: dto?.warehouseName ?? 'Almacén',
      location: null
    }
  }

  validateCreateStock(stock: Stock): boolean {
    let valid = true
    if (!stock.productId) valid = false
    if (!stock.warehouseId) valid = false
    if (!stock.quantity) stock.quantity = 0
    if (stock.quantity < 0) valid = false
    return valid
  }

  validateUpdateStock(stock: Stock): boolean {
    let valid = true
    if (this.existsStock(stock)) {
      stock.id = this.stocks.find(
        s => s.productId === stock.productId && s.warehouseId === stock.warehouseId
      ).id
      if (!stock.id) valid = false
    }
    if (!stock.productId) valid = false
    if (!stock.warehouseId) valid = false
    if (stock.quantity < 0) valid = false
    return valid
  }

  existsStock(stock: Stock): boolean {
    return this.stocks.some(s => s.productId === stock.productId && s.warehouseId === stock.warehouseId)
  }

  existsInStocks(item: Warehouse | Product): boolean {
    return this.stocks.some(s => s.productId === item.id || s.warehouseId === item.id)
  }

  existsWarehouse(warehouse: Warehouse): boolean {
    if (!warehouse) return false
    if (warehouse.id != null) return this.warehouses.some(s => s.id === warehouse.id)
    if (!warehouse.name) return false
    return this.warehouses.some(s => s.name === warehouse.name)
  }

  existsProduct(product: Product): boolean {
    if (!product) return false
    if (product.id != null) return this.products.some(p => p.id === product.id)
    if (!product.name) return false
    return this.products.some(p => p.name === product.name)
  }
}
